export function normalizeBankAccount(form) {
    return {
        bankName: (form.bankName || '').trim(),
        accountNumber: (form.accountNumber || '').replace(/\s/gu, ''),
        accountName: (form.accountName || '').trim(),
    };
}

export function validateBankAccount(form) {
    if (!form.bankName || form.bankName.length > 100) return 'Tên ngân hàng phải có từ 1 đến 100 ký tự.';
    if (!/^[A-Za-z0-9]{1,50}$/.test(form.accountNumber)) return 'Số tài khoản phải có từ 1 đến 50 chữ cái hoặc chữ số, không chứa dấu câu hay ký tự đặc biệt.';
    if (!form.accountName || form.accountName.length > 150) return 'Tên chủ tài khoản phải có từ 1 đến 150 ký tự.';
    return '';
}
