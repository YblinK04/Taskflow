import { auth } from '@/lib/auth';
import { projectService } from '@/services/project.service';
import { SidebarClient } from './sidebar-client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma'

export async function Sidebar() {
   const mockUserId = "user_1"; 

  // 2. Запрашиваем проекты именно для этого пользователя
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: mockUserId },
        { isPublic: true }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
    // преобразованеи для клиентского компонента

    const serializedProjects = projects.map((project) => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
    }));

    return <SidebarClient projects={serializedProjects} userId={mockUserId} />
}