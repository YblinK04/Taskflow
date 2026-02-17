'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react';
import { ProjectItem } from '@/components/projects/project-item';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { signOut } from 'next-auth/react';
import { Project } from "@prisma/client"

interface SidebarClientProps {
  projects: (Omit<Project, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  })[];
  userId: string
}

export function SidebarClient({ projects, userId}: SidebarClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (projectId: string) => {
    return pathname === `/projects/${projectId}`;
  };

  return (
    <>
      <div
       className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
       )}  
      >
        <div className='flex h-14 items-center border-b px-13'>
          {!collapsed && (
            <Link href='/dashboard' className='flex items-center gap-2 font-semibold'>
             
             <LayoutDashboard className='h-5 w-5' />
             <span>Taskflow Pro</span>
            </Link>
          )}
          <Button
           variant='ghost'
           size='icon'
           className={cn('ml-auto', collapsed && 'mx-auto')}
           onClick={() => setCollapsed(!collapsed)}
          >
          </Button>
        </div>

        <div className='flex-1 overflow-hidden py-2'>
          <div className='px-3 py-2'>
            {!collapsed && (
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-xs font-semibold uppercase text-muted-foreground'>
                 Projects
                </h3> 
                <Button
                 variant='ghost'
                 size='icon'
                 className='h-6 w-6'
                 onClick={ () => setCreateDialogOpen(true)}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            )}
            <ScrollArea className='h-[calc(100vh-10rem)]'>
              <div className={cn('space-y-1', collapsed && 'flex flex-col items-center')}>
                {projects.map((project) => (
                  
                  <ProjectItem 
                   key={project.id}
                   project={project}
                   collapsed={collapsed}
                   isActive={isActive(project.id)}
                  
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className='border-t p-3'>
          <div className={cn('space-y-1', collapsed && 'flex flex-col items-center')}>

            <Button
             variant='ghost'
             size={collapsed ? 'icon' : 'default'}
             className={cn('w-full justify-start', collapsed && 'justify-center')}
             asChild
            >
              <Link href='/settings'>
               <Settings className='h-4 w-4' />
               {!collapsed && <span className='ml-2'>Settings</span>}
              </Link>
            </Button>
            <Button
             variant='ghost'
             size={collapsed ?  'icon' : 'default'}
             className={cn('w-full justify-start', collapsed && 'justify-center')}
             onClick={() => signOut({callbackUrl: '/'})}
            >
              <LogOut className='h-4 w-4'/>
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
        
        <CreateProjectDialog 
         open={createDialogOpen}
         onOpenChange={setCreateDialogOpen}
        />
        </div>
    </>
  )
}