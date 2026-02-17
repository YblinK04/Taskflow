import { z } from 'zod';

// базовые схемы для валидации 

export const UserSchema =  z.object({
    id: z.string().cuid(), // поле будет строкой  и оно защищено от подделки id и коллизий
    email: z.string().email(),
    name: z.string().min(2).max(50).optional(),
    role: z.enum(["USER", "ADMIN"]),
    image: z.string().url().optional().nullable(),
    createdAt: z.date(),
    updateAt: z.date(),
});

export const CreatedUserSchema = UserSchema.pick({
    email: true, 
    name: true,
    role: true,
    image: true,
}).extend({
    password: z.string().min(8),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Passwword is required'),
});

export const ProjectSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3b82f6'),
    isPublic: z.boolean().default(false),
    ownerId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const CreateProjectSchema = z.object({
  
  name: z.string().min(1, 'Название обязательно').max(100),
  description: z.string().max(500), 
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  isPublic: z.boolean(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);
export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const TaskSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  order: z.number().int(),
  dueDate: z.date().optional().nullable(),
  projectId: z.string(),
  assigneeId: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTaskSchema = TaskSchema.pick({
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  projectId: true,
  assigneeId: true,
}).extend({
  order: z.number().int().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string(),
});

export const MoveTaskSchema = z.object({
  taskId: z.string(),
  newStatus: TaskStatusSchema,
  newOrder: z.number().int(),
  projectId: z.string().optional(),
});

export const CommentSchema = z.object({
  id: z.string().cuid(),
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  isEdited: z.boolean().default(false),
  taskId: z.string(),
  authorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCommentSchema = CommentSchema.pick({
  content: true,
  taskId: true,
});

export const ProjectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  
});

// Типы TypeScript из схем
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreatedUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type MoveTaskInput = z.infer<typeof MoveTaskSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;