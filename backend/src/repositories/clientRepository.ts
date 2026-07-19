import { PrismaClient, Client } from '@prisma/client';

const prisma = new PrismaClient();

export class ClientRepository {
  /**
   * Fetch client by database ID including associations
   */
  public static async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        account: {
          select: { email: true, status: true }
        },
        coach: true,
        membershipRecords: true
      }
    });
  }

  /**
   * Fetch all clients with dynamic search and status filters
   */
  public static async findAll(filters: { search?: string; status?: string; branchId?: string }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { account: { email: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    return prisma.client.findMany({
      where,
      include: { coach: true },
      orderBy: { joinDate: 'desc' }
    });
  }

  /**
   * Fetch active Client Pool (Active completed PR starter, no coach, completed within 7 days)
   */
  public static async getAvailablePTClientPool() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return prisma.client.findMany({
      where: {
        status: 'active',
        coachId: null,
        prCompletedDate: {
          gte: sevenDaysAgo // within last 7 days
        }
      },
      orderBy: { prCompletedDate: 'desc' }
    });
  }

  /**
   * Accept client profile into coach roster
   */
  public static async claimClient(clientId: string, coachId: string, ptPackage: string) {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    return prisma.$transaction(async (tx) => {
      // 1. Assign coach and PT details
      const client = await tx.client.update({
        where: { id: clientId },
        data: {
          coachId,
          ptPackage,
          renewalDate: nextMonth
        }
      });

      // 2. Increment active count on coach profile
      await tx.coach.update({
        where: { id: coachId },
        data: {
          activeClientsCount: {
            increment: 1
          }
        }
      });

      // 3. Trigger notification record
      await tx.notification.create({
        data: {
          title: 'Coach Assigned & PT Prescribed',
          message: `Trainer accepted your profile and assigned the ${ptPackage} PT Package.`,
          type: 'success',
          targetEmail: client.email
        }
      });

      return client;
    });
  }
}
export default ClientRepository;
