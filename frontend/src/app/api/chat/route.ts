import { NextRequest, NextResponse } from 'next/server';
import { axiosInstance } from '@/utils/axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axiosInstance.post('/chat', body);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to process message' },
      { status: error.response?.status || 500 }
    );
  }
}
