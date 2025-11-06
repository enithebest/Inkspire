import { createConnection } from '$lib/db/mysql';
import { redirect, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export const load = async ({ cookies }) => {
  const token = cookies.get('session');
  if (!token) throw redirect(302, '/login');

  const db = await createConnection();
  const [rows] = await db.query('SELECT id, email, full_name, created_at FROM users WHERE session_token = ?', [token]);
  if (rows.length === 0) {
    db.release();
    throw redirect(302, '/login');
  }

  const user = rows[0];

  // Fetch recent uploads for this user
  const [uploads] = await db.query(
    'SELECT id, image_url, created_at FROM uploads WHERE user_id = ? ORDER BY id DESC LIMIT 100',
    [user.id]
  );

  db.release();

  return { user, uploads };
};

export const actions = {
  update: async ({ request, cookies }) => {
    const token = cookies.get('session');
    if (!token) throw redirect(302, '/login');

    const form = await request.formData();
    const full_name = form.get('full_name');
    const password = form.get('password');

    const db = await createConnection();

    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      await db.execute('UPDATE users SET full_name = ?, password_hash = ? WHERE session_token = ?', [full_name, hashed, token]);
    } else {
      await db.execute('UPDATE users SET full_name = ? WHERE session_token = ?', [full_name, token]);
    }

    db.release();
    return { success: true, message: 'Profile updated successfully' };
  },

  deleteUpload: async ({ request, cookies }) => {
    const token = cookies.get('session');
    if (!token) throw redirect(302, '/login');

    const form = await request.formData();
    const id = Number(form.get('id')) || 0;
    if (!id) return fail(400, { message: 'Invalid upload id' });

    const db = await createConnection();
    // Resolve user id from session
    const [urows] = await db.query('SELECT id FROM users WHERE session_token = ?', [token]);
    if (urows.length === 0) {
      db.release();
      throw redirect(302, '/login');
    }
    const userId = urows[0].id;

    await db.execute('DELETE FROM uploads WHERE id = ? AND user_id = ?', [id, userId]);
    db.release();

    return { success: true };
  }
};
