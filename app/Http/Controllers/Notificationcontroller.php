<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * GET /notifications
     * Halaman penuh semua notifikasi — dirender via Inertia.
     */
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn($n) => [
                'id'      => $n->id,
                'type'    => $n->data['type']  ?? 'info',
                'title'   => $n->data['title'] ?? 'Notifikasi',
                'body'    => $n->data['body']  ?? '',
                'time'    => $n->created_at->diffForHumans(),
                'read_at' => $n->read_at?->toISOString(),
            ]);

        return Inertia::render('Dashboard/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * GET /notifications/unread  (JSON — untuk TopBar polling)
     */
    public function unread(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn($n) => [
                'id'      => $n->id,
                'type'    => $n->data['type']  ?? 'info',
                'title'   => $n->data['title'] ?? 'Notifikasi',
                'body'    => $n->data['body']  ?? '',
                'time'    => $n->created_at->diffForHumans(),
                'read_at' => $n->read_at?->toISOString(),
            ]);

        return response()->json($notifications);
    }

    /**
     * POST /notifications/mark-all-read
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    /**
     * POST /notifications/{id}/read
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    /**
     * DELETE /notifications/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['status' => 'deleted']);
    }
}