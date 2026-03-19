import { NextRequest, NextResponse } from 'next/server';
import { taskService } from '@/services/task.service';
import { auth } from '@/lib/auth';
import { request } from 'http';
import { nextWednesday } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized'}, {status: 401});
        }

        const searchParams = request.nextUrl.searchParams; 
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required'}, {status: 400})
        }

        const tasks = await taskService.getProjectTasks(projectId, session.user.id);

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        )
    }
};

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized'}, {status: 401});
            
        }
        
            const body = await request.json();
            const task = await taskService.create(body, session.user.id);

            return NextResponse.json(task, {status: 201});
    } catch (error: any) {
        console.error('Error creating task', error);

        if (error.message.includes('Project not found')) {
            return NextResponse.json({error: error.message}, {status: 404})
        }

        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized'}, {status: 401});
        }

        const body = await request.json();
        const task = await taskService.update(body, session.user.id);

        return NextResponse.json(task)

    } catch (error: any) {
        console.error('Error updating task', error);

        if (error.message.includes('Task not found')) {
            return NextResponse.json({error: error.message}, {status: 404});
        }

        if (error.message.includes('Project not found')) {
            return NextResponse.json({ error: error.message}, { status: 404});
        }

        return NextResponse.json(
            {error: 'Internal server error'},
            { status: 500}
        )
    }
}
