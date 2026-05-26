<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ShiftController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page
Route::get('/', fn() => Inertia::render('Landing/Home'))->name('home');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Attendance
    Route::get('/attendance',            [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/check-in',  [AttendanceController::class, 'checkIn'])->name('attendance.checkin');
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.checkout');

    // Employees
    Route::resource('/employees', EmployeeController::class)->except(['show', 'edit', 'create']);

    // History + Export
    Route::get('/history/export-pdf',   [HistoryController::class, 'exportPdf'])->name('history.export-pdf');
    Route::get('/history/export-excel', [HistoryController::class, 'exportExcel'])->name('history.export-excel');
    Route::get('/history',              [HistoryController::class, 'index'])->name('history.index');

    // ─── SETTINGS ───────────────────────────────────────────────────────
    Route::get ('/settings',                    [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings/profile',            [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::put ('/settings/password',           [SettingsController::class, 'updatePassword'])->name('settings.password');
    Route::put ('/settings/notifications',      [SettingsController::class, 'updateNotifPrefs'])->name('settings.notifications');
    Route::put ('/settings/privacy',            [SettingsController::class, 'updatePrivacy'])->name('settings.privacy');
    Route::put ('/settings/two-factor',         [SettingsController::class, 'updateTwoFactor'])->name('settings.two-factor');
    Route::delete('/settings/sessions/{id}',   [SettingsController::class, 'revokeSession'])->name('settings.sessions.revoke');
    Route::post('/settings/sessions/logout-all',[SettingsController::class, 'logoutAllSessions'])->name('settings.sessions.logout-all');
    Route::get ('/settings/export-data',        [SettingsController::class, 'exportData'])->name('settings.export-data');
    Route::delete('/settings/account',          [SettingsController::class, 'deleteAccount'])->name('settings.account.delete');
    // ────────────────────────────────────────────────────────────────────

    // Notifications
    Route::get   ('/notifications',                [NotificationController::class, 'index'])->name('notifications.index');
    Route::get   ('/notifications/unread',         [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post  ('/notifications/mark-all-read',  [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::post  ('/notifications/{id}/read',      [NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::delete('/notifications/{id}',           [NotificationController::class, 'destroy'])->name('notifications.destroy');

    //Shift
    Route::resource('shifts', ShiftController::class)->middleware('auth');
    Route::post('shifts/{shift}/assign', [ShiftController::class, 'assign']);
    Route::get('/shifts', [ShiftController::class, 'index'])
        ->name('shifts.index');
    Route::post('/shifts', [ShiftController::class, 'store']);
    Route::put('/shifts/{shift}', [ShiftController::class, 'update']);
    Route::delete('/shifts/{shift}', [ShiftController::class, 'destroy']);
    Route::post('/shifts/{shift}/assign', [
        ShiftController::class,
        'assign'
    ]);
});

require __DIR__.'/auth.php';