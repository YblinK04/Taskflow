import { prisma } from '@/lib/prisma';
import { Task } from '@prisma/client'
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  MoveTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type MoveTaskInput,
  
} from '@/lib/schemas';

export class TaskService {
    // создаем задачу 
    async create(data: CreateTaskInput, userId: string): Promise<Task> {
        const validateData = CreateTaskSchema.parse(data);

        // Проверка доступа юзера к проекту 
        await this.validateProjectAccess(validateData.projectId, userId);

        // если порядок не указан добавим в конец колонки 
        let order = validateData.order;
        if (order === undefined) {
            const lastTask = await prisma.task.findFirst({
                where: {
                    projectId: validateData.projectId,
                    status: validateData.status,
                },
                orderBy: {order: 'desc'},
            });
            order = lastTask ? lastTask.order + 1 : 0;
        }

        const task = await prisma.task.create({
            data: {
                ...validateData,
                order,
            },
        });
        return task
    }

    // обновление таски
    async update(data: UpdateTaskInput, userId: string): Promise<Task> {
        const validateData = UpdateTaskSchema.parse(data);
        const {id, ...updateData} = validateData;

        //Проверяем существование задачи
        const existingTask = await prisma.task.findUnique({
            where: {id},
            include: {project: true}
        });

        if (!existingTask) {
            throw new Error('Task not found');
        }

        // Проверяем доступ
        await this.validateProjectAccess(existingTask.projectId, userId);

        const task = await prisma.task.update({
            where: {id},
            data: updateData,
        });
           return task 
    }
   // Перемещение задачи (для drag & drop)
  async move(data: MoveTaskInput, userId: string): Promise<Task> {
    const validatedData = MoveTaskSchema.parse(data);

    return await prisma.$transaction(async (tx) => {
      // Получаем текущую задачу
      const task = await tx.task.findUnique({
        where: { id: validatedData.taskId },
        include: { project: true },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Проверяем доступ к проекту
      await this.validateProjectAccess(
        validatedData.projectId || task.projectId,
        userId
      );

      const oldStatus = task.status;
      const oldProjectId = task.projectId;
      const newStatus = validatedData.newStatus;
      const newProjectId = validatedData.projectId || oldProjectId;

      // Если статус или проект изменился, обновляем порядок в старой колонке
      if (oldStatus !== newStatus || oldProjectId !== newProjectId) {
        await tx.task.updateMany({
          where: {
            status: oldStatus,
            projectId: oldProjectId,
            order: { gt: task.order },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      }

      // Сдвигаем задачи в новой колонке, чтобы освободить место
      await tx.task.updateMany({
        where: {
          status: newStatus,
          projectId: newProjectId,
          order: { gte: validatedData.newOrder },
        },
        data: {
          order: { increment: 1 },
        },
      });

      // Обновляем задачу
      const updatedTask = await tx.task.update({
        where: { id: validatedData.taskId },
        data: {
          status: newStatus,
          order: validatedData.newOrder,
          projectId: newProjectId,
        },
      });

      return updatedTask;
    });
  }

  // Удаление таски
  async delete(taskId: string, userId: string): Promise<Task> {
    // Проверяем существование задачи
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Проверяем доступ к проекту
    await this.validateProjectAccess(task.projectId, userId);

    // Обновляем порядок остальных таск в колонке
    await prisma.task.updateMany({
      where: {
        status: task.status,
        projectId: task.projectId,
        order: { gt: task.order },
      },
      data: {
        order: { decrement: 1 },
      },
    });

    // Удаляем таску
    const deletedTask = await prisma.task.delete({
      where: { id: taskId },
    });

    return deletedTask;
  }

  // Получение тасков проекта
  async getProjectTasks(projectId: string, userId: string) {
    await this.validateProjectAccess(projectId, userId);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return tasks;
  }

  // Валидация доступа к проекту
  private async validateProjectAccess(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { isPublic: true },
        ],
      },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return project;
  }
}


export const taskService = new TaskService();