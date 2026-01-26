import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const body = await request.json()

    const report = await db.dailyReport.update({
      where: { id },
      data: body,
      include: {
        student: true
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating daily report:', error)
    return NextResponse.json(
      { error: 'Error updating daily report' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    await db.dailyReport.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting daily report:', error)
    return NextResponse.json(
      { error: 'Error deleting daily report' },
      { status: 500 }
    )
  }
}
