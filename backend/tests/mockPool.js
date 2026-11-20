function createMockPool() {
  const state = {
    users: [],
    staff: [],
    admins: [],
    tokens: [],
    nextUserId: 1,
    nextTokenId: 1,
  };

  const normalize = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();

  async function query(sql, params = []) {
    const s = normalize(sql);

    if (s.startsWith('select id from users where username = ? or email = ?')) {
      return [state.users.filter((u) => u.username === params[0] || u.email === params[1])];
    }
    if (s.startsWith('select id from staff where username = ? or email = ?')) {
      return [state.staff.filter((u) => u.username === params[0] || u.email === params[1])];
    }
    if (s.startsWith('select id from admins where username = ? or email = ?')) {
      return [state.admins.filter((u) => u.username === params[0] || u.email === params[1])];
    }

    if (s.startsWith('insert into users')) {
      const user = {
        id: state.nextUserId++,
        full_name: params[0],
        username: params[1],
        email: params[2],
        password: params[3],
        phone: params[4],
        email_verified: false,
        email_verified_at: null,
        created_at: new Date(),
        role: 'customer',
      };
      state.users.push(user);
      return [{ insertId: user.id, affectedRows: 1 }];
    }

    if (s.startsWith('insert into email_verification_tokens')) {
      const row = {
        id: state.nextTokenId++,
        user_id: params[0],
        token_hash: params[1],
        expires_at: params[2],
        used_at: null,
        attempt_count: 0,
        created_at: new Date(),
      };
      state.tokens.push(row);
      return [{ insertId: row.id, affectedRows: 1 }];
    }

    if (s.startsWith('delete from users where id = ?')) {
      state.users = state.users.filter((u) => u.id !== params[0]);
      state.tokens = state.tokens.filter((t) => t.user_id !== params[0]);
      return [{ affectedRows: 1 }];
    }

    if (s.startsWith('select id, email_verified from users where email = ?')) {
      return [state.users.filter((u) => u.email === params[0]).map((u) => ({
        id: u.id, email_verified: u.email_verified,
      }))];
    }

    if (s.startsWith('update email_verification_tokens set attempt_count = ?, used_at = now()')) {
      const token = state.tokens.find((t) => t.id === params[1]);
      if (token) {
        token.attempt_count = params[0];
        token.used_at = new Date();
      }
      return [{ affectedRows: token ? 1 : 0 }];
    }

    if (s.startsWith('update email_verification_tokens set attempt_count = ? where id = ?')) {
      const token = state.tokens.find((t) => t.id === params[1]);
      if (token) token.attempt_count = params[0];
      return [{ affectedRows: token ? 1 : 0 }];
    }

    if (s.startsWith('update email_verification_tokens set used_at = coalesce')) {
      const token = state.tokens.find((t) => t.id === params[0]);
      if (token && !token.used_at) token.used_at = new Date();
      return [{ affectedRows: token ? 1 : 0 }];
    }

    if (s.startsWith('update email_verification_tokens set used_at = now() where id = ? and used_at is null')) {
      const token = state.tokens.find((t) => t.id === params[0] && !t.used_at);
      if (!token) return [{ affectedRows: 0 }];
      token.used_at = new Date();
      return [{ affectedRows: 1 }];
    }

    if (s.startsWith('update users set email_verified = true')) {
      const user = state.users.find((u) => u.id === params[0]);
      if (user) {
        user.email_verified = true;
        user.email_verified_at = new Date();
      }
      return [{ affectedRows: user ? 1 : 0 }];
    }

    if (s.startsWith('update email_verification_tokens set used_at = now() where user_id = ? and used_at is null')) {
      let n = 0;
      state.tokens.forEach((t) => {
        if (t.user_id === params[0] && !t.used_at) {
          t.used_at = new Date();
          n += 1;
        }
      });
      return [{ affectedRows: n }];
    }

    if (s.startsWith('select id, full_name, email, email_verified from users where email = ?')) {
      return [state.users.filter((u) => u.email === params[0]).map((u) => ({
        id: u.id, full_name: u.full_name, email: u.email, email_verified: u.email_verified,
      }))];
    }

    if (s.includes('from email_verification_tokens') && s.includes('used_at is null') && s.includes('order by') && s.includes('created_at desc')) {
      const unused = state.tokens
        .filter((t) => t.user_id === params[0] && !t.used_at)
        .sort((a, b) => b.created_at - a.created_at);
      return unused.length ? [[unused[0]]] : [[]];
    }

    if (s.includes('select count(*) as hourly')) {
      const hourAgo = Date.now() - 60 * 60 * 1000;
      const hourly = state.tokens.filter((t) => t.user_id === params[0] && t.created_at.getTime() > hourAgo).length;
      return [[{ hourly }]];
    }

    if (s.includes('from users where username = ?') && s.includes('email_verified')) {
      const user = state.users.find((u) => u.username === params[0]);
      return [user ? [{ ...user, role: 'customer' }] : []];
    }

    if (s.includes('from staff where username = ?')) {
      const staff = state.staff.find((u) => u.username === params[0]);
      return [staff ? [staff] : []];
    }

    if (s.includes('from admins where username = ?')) {
      const admin = state.admins.find((u) => u.username === params[0]);
      return [admin ? [admin] : []];
    }

    throw new Error(`Unhandled SQL in mock pool: ${sql}`);
  }

  return {
    state,
    query: jest.fn(query),
    getConnection: jest.fn(async () => ({
      query: jest.fn(query),
      beginTransaction: jest.fn(async () => {}),
      commit: jest.fn(async () => {}),
      rollback: jest.fn(async () => {}),
      release: jest.fn(),
    })),
  };
}

module.exports = { createMockPool };
