<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    /**
     * GET /settings
     */
    public function index(Request $request)
    {
        return inertia('Settings', [
            'auth' => ['user' => $request->user()],
        ]);
    }

    /**
     * PUT /settings/profile
     * Update nama, email, phone, job_title, dan avatar.
     * Dikirim sebagai multipart/form-data (ada upload foto).
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone'     => ['nullable', 'string', 'max:20'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'avatar'    => ['nullable', 'image', 'max:2048'],
        ]);

        // Upload avatar jika ada
        if ($request->hasFile('avatar')) {
            // Hapus avatar lama jika ada
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar_path'] = $path;
            $validated['avatar_url']  = Storage::disk('public')->url($path);
        }

        unset($validated['avatar']); // jangan simpan File object
        $user->update($validated);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * PUT /settings/password
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak sesuai.'],
            ]);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return back()->with('success', 'Password berhasil diubah.');
    }

    /**
     * PUT /settings/notifications
     */
    public function updateNotifPrefs(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'checkin'       => ['boolean'],
            'late'          => ['boolean'],
            'absent'        => ['boolean'],
            'auto_checkout' => ['boolean'],
            'channels'      => ['nullable', 'array'],
            'channels.email'  => ['boolean'],
            'channels.push'   => ['boolean'],
            'channels.in_app' => ['boolean'],
        ]);

        $request->user()->update([
            'notification_preferences' => $validated,
        ]);

        return back()->with('success', 'Preferensi notifikasi disimpan.');
    }

    /**
     * PUT /settings/privacy
     */
    public function updatePrivacy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'profile_visible'  => ['boolean'],
            'show_email'       => ['boolean'],
            'show_phone'       => ['boolean'],
            'show_last_active' => ['boolean'],
        ]);

        $request->user()->update(['privacy' => $validated]);

        return back()->with('success', 'Pengaturan privasi disimpan.');
    }

    /**
     * PUT /settings/two-factor
     */
    public function updateTwoFactor(Request $request): RedirectResponse
    {
        $request->validate(['enabled' => ['required', 'boolean']]);
        $request->user()->update(['two_factor_enabled' => $request->boolean('enabled')]);
        return back();
    }

    /**
     * DELETE /settings/sessions/{id}
     * Revoke single session.
     */
    public function revokeSession(Request $request, $id): RedirectResponse
    {
        // Jika menggunakan Laravel Sanctum, hapus token by id
        // $request->user()->tokens()->where('id', $id)->delete();

        // Jika menggunakan session biasa, tidak ada implementasi default.
        // Tambahkan logika sesuai package auth kamu.

        return back()->with('success', 'Sesi berhasil dicabut.');
    }

    /**
     * POST /settings/sessions/logout-all
     * Logout dari semua device kecuali yang sekarang.
     */
    public function logoutAllSessions(Request $request): RedirectResponse
    {
        // Sanctum: hapus semua token kecuali current
        // $request->user()->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return back()->with('success', 'Berhasil logout dari semua perangkat lain.');
    }

    /**
     * GET /settings/export-data
     * Export data user sebagai JSON.
     */
    public function exportData(Request $request)
    {
        $user = $request->user()->load([/* relasi relevan */ ]);

        $data = [
            'profile'                   => $user->only(['name','email','phone','job_title']),
            'notification_preferences'  => $user->notification_preferences,
            'privacy'                   => $user->privacy,
            'exported_at'               => now()->toISOString(),
        ];

        return response()->json($data)
            ->header('Content-Disposition', 'attachment; filename="humane-data-export.json"');
    }

    /**
     * DELETE /settings/account
     * Hapus akun user (soft delete atau hard delete).
     */
    public function deleteAccount(Request $request): RedirectResponse
    {
        $user = $request->user();
        auth()->logout();
        $user->delete(); // Pastikan model menggunakan SoftDeletes jika diperlukan
        return redirect('/')->with('success', 'Akun berhasil dihapus.');
    }
}