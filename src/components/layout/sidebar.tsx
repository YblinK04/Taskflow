import { auth } from '@/lib/auth';
import { projectService } from '@/services/project.service';
import { SidebarClient } from './sidebar-client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Project } from "@prisma/client"

export async function Sidebar() {
  const mockUserId = "user_1"; 
  let projects: Project[] = []
  
  
  try {

       projects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: mockUserId },
            { isPublic: true }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
     console.error("Критическая ошибка Prisma в Sidebar:", error);
    }
  
    

    const serializedProjects = projects.map((project) => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
    }));

    return <SidebarClient projects={serializedProjects} userId={mockUserId} />
}