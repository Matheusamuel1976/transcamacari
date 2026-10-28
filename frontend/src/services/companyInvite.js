const KEY = 'transcamacari-company-invite';

export function saveCompanyInvite(invite) {
  if (!invite?.code) return;
  sessionStorage.setItem(KEY, JSON.stringify({ code: invite.code, expires_at: invite.expires_at || '' }));
}

export function readCompanyInvite() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || { code: '', expires_at: '' };
  } catch {
    return { code: '', expires_at: '' };
  }
}
