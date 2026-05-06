/**
 * WMSU-SAMS Super Admin Engine
 * Role: SYSTEM-LEVEL CONTROL ONLY (not operational)
 * Rule: ONLY ONE Super Admin exists in the system (SA-001)
 */

// ══════════════════════════════════════════
// RBAC GUARD — Single Super Admin
// ══════════════════════════════════════════
const CURRENT_USER = { id: 'SA-001', name: 'Super Admin', role: 'super_admin' };

function requireSuperAdmin() {
  if (CURRENT_USER.role !== 'super_admin') {
    alert('Access Denied: Super Admin only.');
    window.location.href = '../index.html';
  }
}
requireSuperAdmin();

// ══════════════════════════════════════════
// AUDIT LOG (immutable append-only)
// ══════════════════════════════════════════
// All log entries attributed to single SA-001 only
const auditLogs = [
  { time: '2026-05-06 11:14', user: 'SA-001', role: 'super_admin', action: 'create_admin', target: 'jdoe@wmsu.edu.ph', dept: 'CCS', detail: 'Admin account created' },
  { time: '2026-05-06 10:02', user: 'admin-ccs', role: 'department_admin', action: 'approve_student', target: '2022-00145', dept: 'CCS', detail: 'Maria Santos approved' },
  { time: '2026-05-05 16:40', user: 'SA-001', role: 'super_admin', action: 'update_setting', target: 'payroll_rate', dept: '—', detail: 'Rate changed to ₱45/hr' },
  { time: '2026-05-05 09:21', user: 'SA-001', role: 'super_admin', action: 'system_override', target: 'PAY-0218', dept: 'CCS', detail: 'Payroll adjusted ₱145,200→₱132,000' },
  { time: '2026-05-04 14:00', user: 'admin-cn', role: 'department_admin', action: 'reject_student', target: '2023-00072', dept: 'CN', detail: 'Ana Reyes rejected — invalid COR' },
  { time: '2026-05-04 02:00', user: 'SA-001', role: 'super_admin', action: 'backup_restore', target: 'Full Backup', dept: '—', detail: 'Scheduled backup completed' },
  { time: '2026-05-03 08:45', user: 'admin-ccs', role: 'department_admin', action: 'login', target: 'admin-ccs', dept: 'CCS', detail: 'Login from 192.168.1.10' },
];

function appendAuditLog(action, target, dept, detail) {
  const now = new Date();
  const entry = {
    time: now.toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }),
    user: CURRENT_USER.id,
    role: CURRENT_USER.role,
    action, target, dept, detail
  };
  auditLogs.unshift(entry); // prepend
  renderAuditLogs();
  updateDashboardActivity();
}

function renderAuditLogs(filtered = null) {
  const tbody = document.getElementById('audit-logs-table');
  if (!tbody) return;
  const logs = filtered || auditLogs;
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${l.time}</td>
      <td>${l.user}</td>
      <td><span class="badge ${roleBadge(l.role)}">${l.role}</span></td>
      <td><span class="badge ${actionBadge(l.action)}">${l.action}</span></td>
      <td>${l.target}</td>
      <td>${l.dept}</td>
      <td>${l.detail}</td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:#999;">No logs found</td></tr>';
}

function roleBadge(r) {
  return r === 'super_admin' ? 'maroon' : r === 'department_admin' ? 'blue' : 'verified';
}
function actionBadge(a) {
  if (a.includes('override') || a.includes('reject') || a.includes('delete')) return 'pending';
  if (a.includes('approve') || a.includes('backup')) return 'active';
  return 'verified';
}

// ══════════════════════════════════════════
// ADMIN MANAGEMENT DATA
// ══════════════════════════════════════════
// CPPPESO Staff who manage SAMS — NOT academic college departments
let admins = [
  { id: 'ADM-001', name: 'Juan Dela Cruz', email: 'jdelacru@wmsu.edu.ph', dept: 'Student Assistant Coordination', status: 'active', permission: 'full', lastLogin: 'May 6, 2026' },
  { id: 'ADM-002', name: 'Maria Reyes', email: 'mreyes@wmsu.edu.ph', dept: 'Records & Verification Section', status: 'active', permission: 'limited', lastLogin: 'May 5, 2026' },
  { id: 'ADM-003', name: 'Carlos Bautista', email: 'cbautista@wmsu.edu.ph', dept: 'Payroll Processing Section', status: 'suspended', permission: 'limited', lastLogin: 'Apr 30, 2026' },
  { id: 'ADM-004', name: 'Liza Fernandez', email: 'lfernandez@wmsu.edu.ph', dept: 'Attendance Monitoring Unit', status: 'active', permission: 'full', lastLogin: 'May 4, 2026' },
  { id: 'ADM-005', name: 'Ramon Uy', email: 'ruy@wmsu.edu.ph', dept: 'Department Liaison Officer', status: 'inactive', permission: 'limited', lastLogin: 'Mar 12, 2026' },
];

function renderAdminTable() {
  const tbody = document.getElementById('admin-management-table');
  if (!tbody) return;
  tbody.innerHTML = admins.map(a => `
    <tr>
      <td>
        <div class="t-avatar">
          <div class="av av-a">${a.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div><div class="td-name">${a.name}</div><div class="td-sub">${a.email}</div></div>
        </div>
      </td>
      <td>${a.email}</td>
      <td>${a.dept}</td>
      <td><span class="badge ${statusBadge(a.status)}">${a.status}</span></td>
      <td>${a.lastLogin}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-outline" onclick="editAdmin('${a.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm" style="background:#fef3c7;color:#92400e;" onclick="forceResetPassword('${a.id}','${a.name}')"><i class="fas fa-key"></i></button>
          ${a.status === 'active'
            ? `<button class="btn btn-sm btn-reject" onclick="suspendAdmin('${a.id}','${a.name}')"><i class="fas fa-ban"></i></button>`
            : `<button class="btn btn-sm btn-approve" onclick="activateAdmin('${a.id}','${a.name}')"><i class="fas fa-check"></i></button>`}
        </div>
      </td>
    </tr>`).join('');
}

function statusBadge(s) {
  return s === 'active' ? 'active' : s === 'suspended' ? 'pending' : 'verified';
}

function suspendAdmin(id, name) {
  if (!confirm(`Suspend admin "${name}"? They will lose system access immediately.`)) return;
  const a = admins.find(x => x.id === id);
  if (a) { a.status = 'suspended'; renderAdminTable(); updateDashboardStats(); }
  appendAuditLog('suspend_admin', id, a.dept, `${name} suspended by Super Admin`);
  showToast(`Admin "${name}" suspended.`, 'warn');
}

function activateAdmin(id, name) {
  const a = admins.find(x => x.id === id);
  if (a) { a.status = 'active'; renderAdminTable(); updateDashboardStats(); }
  appendAuditLog('activate_admin', id, a.dept, `${name} reactivated by Super Admin`);
  showToast(`Admin "${name}" reactivated.`, 'success');
}

function forceResetPassword(id, name) {
  if (!confirm(`Force password reset for "${name}"?`)) return;
  appendAuditLog('force_reset_password', id, '—', `Password reset forced for ${name}`);
  showToast(`Password reset link sent to ${name}.`, 'success');
}

function editAdmin(id) {
  const a = admins.find(x => x.id === id);
  if (!a) return;
  document.getElementById('modal-admin-name').value = a.name;
  document.getElementById('modal-admin-email').value = a.email;
  document.getElementById('modal-admin-dept').value = a.dept;
  document.getElementById('modal-admin-permission').value = a.permission;
  document.getElementById('modal-admin-id').value = a.id;
  document.getElementById('modal-admin-title').textContent = 'Edit CPPPESO Staff Account';
  openModal('modal-admin-form');
}

// ── Create Admin ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btnCreate = document.getElementById('btn-create-admin');
  if (btnCreate) btnCreate.addEventListener('click', () => {
    clearAdminForm();
    document.getElementById('modal-admin-title').textContent = 'Create CPPPESO Staff Account';
    openModal('modal-admin-form');
    document.getElementById('btn-save-maintenance')?.addEventListener('click', saveMaintenance);

  initAll();
});

  const saveBtn = document.getElementById('btn-save-admin');
  if (saveBtn) saveBtn.addEventListener('click', saveAdmin);

  const saveSettings = document.getElementById('btn-save-settings');
  if (saveSettings) saveSettings.addEventListener('click', saveGlobalSettings);

  const exportBtn = document.getElementById('btn-export-audit');
  if (exportBtn) exportBtn.addEventListener('click', exportAuditCSV);

  const refreshBtn = document.getElementById('btn-refresh-audit');
  if (refreshBtn) refreshBtn.addEventListener('click', () => { renderAuditLogs(); showToast('Logs refreshed.', 'success'); });

  const filterInputs = ['audit-filter-user','audit-filter-role','audit-filter-action','audit-filter-start','audit-filter-end'];
  filterInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', filterAuditLogs);
  });

  const overrideBtn = document.getElementById('btn-enrollment-override');
  if (overrideBtn) overrideBtn.addEventListener('click', applyEnrollmentOverride);

  const manualBackup = document.getElementById('btn-manual-backup');
  if (manualBackup) manualBackup.addEventListener('click', initiateManualBackup);

  const freezeBtn = document.getElementById('btn-freeze-payroll');
  if (freezeBtn) freezeBtn.addEventListener('click', freezePayroll);

  initAll();
});

function clearAdminForm() {
  ['modal-admin-name','modal-admin-email','modal-admin-dept','modal-admin-id'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const perm = document.getElementById('modal-admin-permission');
  if (perm) perm.value = 'limited';
}

function saveAdmin() {
  const id = document.getElementById('modal-admin-id').value;
  const name = document.getElementById('modal-admin-name').value.trim();
  const email = document.getElementById('modal-admin-email').value.trim();
  const dept = document.getElementById('modal-admin-dept').value.trim();
  const permission = document.getElementById('modal-admin-permission').value;

  if (!name || !email || !dept) { showToast('Name, email, and CPPPESO Section are all required.', 'warn'); return; }

  if (id) {
    const a = admins.find(x => x.id === id);
    if (a) { a.name = name; a.email = email; a.dept = dept; a.permission = permission; }
    appendAuditLog('update_admin', id, dept, `${name} account updated`);
    showToast('Admin account updated.', 'success');
  } else {
    const newAdmin = { id: 'ADM-' + String(admins.length + 1).padStart(3,'0'), name, email, dept, status: 'active', permission, lastLogin: 'Never' };
    admins.push(newAdmin);
    appendAuditLog('create_admin', newAdmin.id, dept, `${name} admin created`);
    showToast('Admin account created.', 'success');
  }
  closeModal('modal-admin-form');
  renderAdminTable();
  updateDashboardStats();
}

// ══════════════════════════════════════════
// GLOBAL SYSTEM SETTINGS
// ══════════════════════════════════════════
const systemSettings = {
  current_school_year: 'AY 2025-2026',
  current_semester: '2nd',
  application_open: 'true',
  application_deadline: '2026-06-30',
  interview_start_date: '2026-07-07',
  deployment_date: '2026-07-14',
  payroll_rate_per_hour: 45,
  max_hours_per_month: 80,
  payroll_cutoff_day: 15,
  max_assistants_per_department: 10,
  total_system_capacity: 200,
  minimum_gwa: 2.50,
  minimum_year_level: '2',
  allow_concurrent_scholarship: 'false',
  allow_self_registration: 'true',
  require_dept_approval: 'true',
  student_payroll_visibility: 'true',
  attendance_grace_minutes: 15,
};

function loadGlobalSettings() {
  Object.entries(systemSettings).forEach(([key, val]) => {
    const el = document.querySelector(`[name="${key}"]`);
    if (el) el.value = val;
  });
}

function saveGlobalSettings() {
  const form = document.getElementById('settings-form');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select, textarea');
  const changed = [];
  inputs.forEach(el => {
    if (el.name && systemSettings[el.name] !== undefined) {
      if (String(systemSettings[el.name]) !== el.value) {
        changed.push(`${el.name}: ${systemSettings[el.name]} → ${el.value}`);
        systemSettings[el.name] = el.value;
      }
    }
  });
  if (changed.length === 0) { showToast('No changes detected.', 'warn'); return; }
  appendAuditLog('update_setting', 'system_settings', '—', changed.join('; '));
  showToast('Global settings saved successfully.', 'success');
}

function resetSettingsToDefault() {
  if (!confirm('Reset all settings to system defaults?\nThis will overwrite your current configuration.')) return;
  const defaults = {
    current_school_year: 'AY 2025-2026', current_semester: '2nd', application_open: 'true',
    application_deadline: '2026-06-30', payroll_rate_per_hour: 45, max_hours_per_month: 80,
    payroll_cutoff_day: 15, max_assistants_per_department: 10, total_system_capacity: 200,
    minimum_gwa: 2.50, minimum_year_level: '2', allow_concurrent_scholarship: 'false',
  };
  Object.entries(defaults).forEach(([k, v]) => {
    const el = document.querySelector(`[name="${k}"]`);
    if (el) el.value = v;
    systemSettings[k] = v;
  });
  appendAuditLog('update_setting', 'system_settings', '—', 'Settings reset to system defaults');
  showToast('Settings reset to defaults.', 'success');
}

// ══════════════════════════════════════════
// AUDIT LOG FILTER & EXPORT
// ══════════════════════════════════════════
function filterAuditLogs() {
  const user   = (document.getElementById('audit-filter-user')?.value || '').toLowerCase();
  const role   = document.getElementById('audit-filter-role')?.value || '';
  const action = document.getElementById('audit-filter-action')?.value || '';
  const start  = document.getElementById('audit-filter-start')?.value || '';
  const end    = document.getElementById('audit-filter-end')?.value || '';

  const filtered = auditLogs.filter(l => {
    if (user && !l.user.toLowerCase().includes(user) && !l.target.toLowerCase().includes(user)) return false;
    if (role && l.role !== role) return false;
    if (action && l.action !== action) return false;
    const logDate = l.time.split(' ')[0];
    if (start && logDate < start) return false;
    if (end && logDate > end) return false;
    return true;
  });
  renderAuditLogs(filtered);
}

function exportAuditCSV() {
  const headers = ['Time','User','Role','Action','Target','Department','Detail'];
  const rows = auditLogs.map(l => [l.time, l.user, l.role, l.action, l.target, l.dept, l.detail].map(v => `"${v}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `SAMS_AuditLog_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  appendAuditLog('export_audit_log', 'audit_logs.csv', '—', 'Audit log exported to CSV');
  showToast('Audit log exported.', 'success');
}

// ══════════════════════════════════════════
// SYSTEM OVERRIDE
// ══════════════════════════════════════════
let activeOverrides = 0;

function applyEnrollmentOverride() {
  const sid    = document.getElementById('enrollment-student-id')?.value.trim();
  const action = document.getElementById('enrollment-action-type')?.value;
  const reason = document.getElementById('enrollment-reason-text')?.value.trim();

  if (!sid || !action || action === 'Choose Action...' || !reason) {
    showToast('Student ID, action, and reason are all required.', 'warn'); return;
  }
  if (!confirm(`⚠️ Apply "${action}" to student ${sid}?\nReason: ${reason}\n\nThis will be permanently logged.`)) return;

  activeOverrides++;
  document.getElementById('override-active-count').textContent = activeOverrides;
  document.getElementById('override-status').textContent = 'Override Active';

  appendAuditLog('system_override', sid, '—', `${action} — Reason: ${reason}`);
  showToast(`Override applied to ${sid}.`, 'warn');

  if (document.getElementById('enrollment-student-id')) document.getElementById('enrollment-student-id').value = '';
  if (document.getElementById('enrollment-reason-text')) document.getElementById('enrollment-reason-text').value = '';
  if (document.getElementById('enrollment-action-type')) document.getElementById('enrollment-action-type').value = 'Choose Action...';
}

function freezePayroll() {
  if (!confirm('⚠️ FREEZE all payroll operations globally?\n\nThis will halt all pending payroll processing until unfrozen.')) return;
  appendAuditLog('system_override', 'payroll_global', '—', 'Global payroll FROZEN by Super Admin');
  const btn = document.getElementById('btn-freeze-payroll');
  if (btn) { btn.textContent = '✓ Payroll Frozen'; btn.style.background = '#dc2626'; btn.style.color = '#fff'; }
  showToast('Payroll operations frozen globally.', 'warn');
}

// ══════════════════════════════════════════
// BACKUP SIMULATION
// ══════════════════════════════════════════
function initiateManualBackup() {
  const label = `Manual_Backup_${new Date().toISOString().slice(0,10)}`;
  const card = document.getElementById('backup-progress-card');
  if (card) card.style.display = 'block';

  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 15) + 5;
    if (pct >= 100) { pct = 100; clearInterval(interval); finishBackup(label, card); }
    const bar = document.getElementById('progress-bar');
    const pctEl = document.getElementById('progress-percentage');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }, 400);

  showToast('Manual backup started...', 'success');
}

function finishBackup(label, card) {
  setTimeout(() => { if (card) card.style.display = 'none'; }, 1500);
  const now = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
  const el = document.getElementById('backup-last-time');
  if (el) el.textContent = now;
  const el2 = document.getElementById('dashboard-last-backup');
  if (el2) el2.textContent = 'Just now';
  appendAuditLog('backup_restore', label, '—', 'Manual backup completed successfully');
  showToast('Backup completed successfully!', 'success');
}

function openRestoreModal() { openModal('backup-settings-modal'); }
function openBackupSettingsModal() { openModal('backup-settings-modal'); }
function saveBackupSettings() {
  appendAuditLog('update_setting', 'backup_config', '—', 'Backup schedule/retention updated');
  closeModal('backup-settings-modal');
  showToast('Backup settings saved.', 'success');
}
function filterBackups() {}
function viewBackupDetails(name) { showToast(`Backup: ${name}`, 'success'); }
function deleteBackup(name) {
  if (!confirm(`Delete backup "${name}"? This cannot be undone.`)) return;
  showToast(`Backup "${name}" deleted.`, 'warn');
  appendAuditLog('delete_backup', name, '—', 'Backup file deleted by Super Admin');
}

// ══════════════════════════════════════════
// ADDITIONAL OVERRIDE HANDLERS
// ══════════════════════════════════════════

function commitPayrollAdjustment() {
  const tid    = document.getElementById('payroll-transaction-id')?.value.trim();
  const amount = document.getElementById('payroll-adjusted-amount')?.value.trim();
  const reason = document.getElementById('payroll-adjustment-reason')?.value.trim();
  if (!tid || !amount || !reason) { showToast('Transaction ID, adjusted value, and reason are all required.', 'warn'); return; }
  if (!confirm(`Commit adjustment for ${tid} → ₱${Number(amount).toLocaleString()}?\nReason: ${reason}\n\nThis will be permanently logged.`)) return;
  appendAuditLog('system_override', tid, '—', `Payroll adjusted to ₱${Number(amount).toLocaleString()} — ${reason}`);
  showToast(`Payroll ${tid} adjusted. Logged permanently.`, 'warn');
  document.getElementById('payroll-transaction-id').value = '';
  document.getElementById('payroll-adjusted-amount').value = '';
  document.getElementById('payroll-adjustment-reason').value = '';
}

function recomputePayroll() {
  if (!confirm('Force full system re-compute of all payroll entries?\nThis may take a few minutes.')) return;
  appendAuditLog('system_override', 'payroll_all', '—', 'Full payroll re-computation triggered by Super Admin');
  showToast('Payroll re-computation queued.', 'success');
}

function applyRuleOverride() {
  const key   = document.getElementById('rule-override-key')?.value.trim();
  const value = document.getElementById('rule-override-value')?.value.trim();
  if (!key || !value) { showToast('Config target and override value are required.', 'warn'); return; }
  if (!confirm(`Override rule:\n${key} → ${value}\n\nThis bypasses system validation and will be logged.`)) return;
  appendAuditLog('system_override', key, '—', `Rule override: ${key} set to "${value}"`);
  showToast(`Rule override applied: ${key} = ${value}`, 'warn');
  document.getElementById('rule-override-key').value = '';
  document.getElementById('rule-override-value').value = '';
}

function toggleLockdown(checkbox) {
  const reason = document.getElementById('lockdown-comments')?.value.trim();
  if (checkbox.checked) {
    if (!reason) {
      showToast('You must provide a justification before enabling lockdown.', 'warn');
      checkbox.checked = false;
      return;
    }
    if (!confirm('⚠️ ENABLE GLOBAL READ-ONLY LOCKDOWN?\nAll operations (registration, payroll, attendance) will freeze.\n\nProceed?')) {
      checkbox.checked = false;
      return;
    }
    appendAuditLog('system_override', 'system_lockdown', '—', `LOCKDOWN ENABLED — ${reason}`);
    document.getElementById('override-status').textContent = 'LOCKED';
    document.getElementById('override-status').style.color = '#dc2626';
    showToast('System is now in READ-ONLY Lockdown mode.', 'error');
  } else {
    appendAuditLog('system_override', 'system_lockdown', '—', 'LOCKDOWN LIFTED by Super Admin');
    document.getElementById('override-status').textContent = 'Normal';
    document.getElementById('override-status').style.color = '';
    showToast('Lockdown lifted. System restored to normal.', 'success');
  }
}

// ══════════════════════════════════════════
// DASHBOARD STATS & SECURITY ALERTS
// ══════════════════════════════════════════
function updateDashboardStats() {
  const active = admins.filter(a => a.status === 'active').length;
  const el = document.getElementById('dashboard-total-admins');
  if (el) el.textContent = active;
  const badge = document.getElementById('sidebar-badge-students');
  if (badge) badge.textContent = admins.filter(a => a.status === 'active').length;
  const depts = document.getElementById('dashboard-departments');
  if (depts) depts.textContent = [...new Set(admins.map(a => a.dept))].length;
}

function updateDashboardActivity() {
  const tbody = document.getElementById('dashboard-recent-activity');
  if (!tbody) return;
  tbody.innerHTML = auditLogs.slice(0, 8).map(l => `
    <tr>
      <td>${l.time}</td>
      <td>${l.user}</td>
      <td><span class="badge ${roleBadge(l.role)}">${l.role}</span></td>
      <td>${l.action}</td>
      <td>${l.target}</td>
      <td><span class="badge ${actionBadge(l.action)}">Logged</span></td>
    </tr>`).join('');
}

function updateSecurityAlerts() {
  const ul = document.getElementById('dashboard-security-alerts');
  if (!ul) return;
  const alerts = [
    { icon: 'fa-exclamation-triangle', color: 'var(--yellow)', text: 'Admin ADM-003 (Carlos Bautista) is currently suspended.', time: '2 days ago' },
    { icon: 'fa-shield-alt', color: 'var(--red)', text: 'System override applied to student 2026-10491 — verify audit trail.', time: '1 hour ago' },
    { icon: 'fa-lock', color: 'var(--blue)', text: 'Payroll rate changed from ₱40 to ₱45/hr — confirm authorization.', time: 'Yesterday' },
  ];
  ul.innerHTML = alerts.map(a => `
    <li class="activity-item">
      <div class="activity-dot warn"><i class="fas ${a.icon}" style="color:${a.color}"></i></div>
      <div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div>
    </li>`).join('');
}

// ══════════════════════════════════════════
// CLOCK + MODAL HELPERS
// ══════════════════════════════════════════
function updateClock() {
  const el = document.getElementById('topbar-clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
}

function toggleNotifPanel() {
  const p = document.getElementById('notif-panel');
  if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}
function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = 'none';
}

function showToast(msg, type = 'success') {
  const existing = document.querySelector('.sa-toast');
  if (existing) existing.remove();
  const colors = { success: '#15803d', warn: '#b45309', error: '#dc2626' };
  const t = document.createElement('div');
  t.className = 'sa-toast';
  t.textContent = msg;
  t.style.cssText = `position:fixed;top:20px;right:20px;background:${colors[type]||colors.success};color:#fff;
    padding:14px 20px;border-radius:8px;z-index:9999;font-size:14px;font-weight:500;
    box-shadow:0 4px 16px rgba(0,0,0,0.2);animation:slideIn 0.3s ease;max-width:360px;`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function openSYManager() { showToast('School Year Manager — configure in Global Settings.', 'success'); }

// ══════════════════════════════════════════
// INIT ALL
// ══════════════════════════════════════════
function initAll() {
  setInterval(updateClock, 1000);
  updateClock();
  renderAdminTable();
  updateDashboardStats();
  updateDashboardActivity();
  updateSecurityAlerts();
  renderAuditLogs();
  loadGlobalSettings();

  // Close modals on backdrop click
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
  });

  // Pending apps stat
  const pending = document.getElementById('dashboard-pending-apps');
  if (pending) pending.textContent = '13';
}

function onMaintToggle(cb) {
  const row = document.getElementById('maint-toggle-row');
  const sub = document.getElementById('maint-toggle-sub');
  const val = document.getElementById('maint-status-val');
  if (cb.checked) {
    row.style.borderColor = '#d97706';
    row.style.background  = '#fffbeb';
    sub.textContent = 'System will enter maintenance at the scheduled start time';
    val.textContent = 'Scheduled';
  } else {
    row.style.borderColor = '#e5e7eb';
    row.style.background  = '#fafafa';
    sub.textContent = 'System is currently live and accepting all operations';
    val.textContent = 'Offline';
  }
}

function onAnnToggle(cb) {
  document.getElementById('ann-status-val').textContent = cb.checked ? 'Active' : 'None';
}

function updateMaintPreview(msg) {
  const el = document.getElementById('maint-preview-text');
  el.textContent = msg.trim() ? msg : 'Enter a message above to preview it here.';
}

function updateAnnPreview() {
  const msg  = document.querySelector('[name="announcement_message"]').value.trim();
  const type = document.querySelector('[name="announcement_type"]').value;
  const bar  = document.getElementById('ann-preview-bar');
  const icon = document.getElementById('ann-preview-icon');
  const text = document.getElementById('ann-preview-text');
  const styles = {
    info:    { bg:'#eff6ff', border:'#bfdbfe', color:'#1e40af', iconColor:'#1d4ed8', icon:'fa-info-circle' },
    warning: { bg:'#fffbeb', border:'#fcd34d', color:'#92400e', iconColor:'#b45309', icon:'fa-exclamation-triangle' },
    urgent:  { bg:'#fef2f2', border:'#fecaca', color:'#991b1b', iconColor:'#dc2626', icon:'fa-exclamation-circle' },
    success: { bg:'#ecfdf5', border:'#6ee7b7', color:'#065f46', iconColor:'#059669', icon:'fa-check-circle' },
  };
  const s = styles[type] || styles.info;
  bar.style.background  = s.bg;
  bar.style.borderColor = s.border;
  icon.className        = `fas ${s.icon}`;
  icon.style.color      = s.iconColor;
  text.style.color      = s.color;
  text.style.fontStyle  = msg ? 'normal' : 'italic';
  text.textContent      = msg || 'Type a message above to preview the banner.';
}

function updateMaintStats() {
  const start = document.querySelector('[name="maintenance_start"]').value;
  const val   = document.getElementById('maint-window-val');
  if (start) {
    const d = new Date(start);
    val.textContent = d.toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })
      + ' ' + d.toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit' });
  } else {
    val.textContent = 'Not scheduled';
  }
}

function resetMaintenance() {
  document.getElementById('maintenance_mode').checked    = false;
  document.getElementById('announcement_active').checked = false;
  onMaintToggle({ checked: false });
  onAnnToggle({ checked: false });
  document.querySelector('[name="maintenance_message"]').value  = '';
  document.querySelector('[name="announcement_message"]').value = '';
  updateMaintPreview('');
  updateAnnPreview();
  updateMaintStats();
}

function saveMaintenance() {
  const payload = {
    maintenance_mode:         document.getElementById('maintenance_mode').checked,
    maintenance_start:        document.querySelector('[name="maintenance_start"]').value,
    maintenance_end:          document.querySelector('[name="maintenance_end"]').value,
    maintenance_scope:        document.querySelector('[name="maintenance_scope"]').value,
    maintenance_message:      document.querySelector('[name="maintenance_message"]').value,
    announcement_active:      document.getElementById('announcement_active').checked,
    announcement_type:        document.querySelector('[name="announcement_type"]').value,
    announcement_message:     document.querySelector('[name="announcement_message"]').value,
    announcement_start:       document.querySelector('[name="announcement_start"]').value,
    announcement_expires:     document.querySelector('[name="announcement_expires"]').value,
    announcement_dismissible: document.querySelector('[name="announcement_dismissible"]').value,
    announcement_targets: {
      all:      document.querySelector('[name="ann_target_all"]').checked,
      students: document.querySelector('[name="ann_target_students"]').checked,
      dept:     document.querySelector('[name="ann_target_dept"]').checked,
      staff:    document.querySelector('[name="ann_target_staff"]').checked,
    },
    notify_first:  document.querySelector('[name="notify_first"]').value,
    notify_second: document.querySelector('[name="notify_second"]').value,
    notify_final:  document.querySelector('[name="notify_final"]').value,
    notify_inapp:  document.querySelector('[name="notify_inapp"]').checked,
    notify_email:  document.querySelector('[name="notify_email"]').checked,
    notify_banner: document.querySelector('[name="notify_banner"]').checked,
    notify_sms:    document.querySelector('[name="notify_sms"]').checked,
  };
  console.log('Maintenance payload:', payload);
  appendAuditLog('update_setting', 'maintenance_config', '—', 'Maintenance/announcement settings updated');
  showToast('Maintenance and announcement settings saved.', 'success');
}
