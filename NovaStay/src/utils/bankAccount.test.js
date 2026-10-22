import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBankAccount, validateBankAccount } from './bankAccount.js';

test('pasted account numbers accept whitespace and keep leading zeroes', () => {
    const form = normalizeBankAccount({ bankName: ' Ngân hàng A ', accountNumber: ' 0012 3456\u00a07890\n', accountName: ' NGUYỄN VĂN A ' });
    assert.equal(form.accountNumber, '001234567890');
    assert.equal(form.accountName, 'NGUYỄN VĂN A');
    assert.equal(validateBankAccount(form), '');
});

test('invalid values identify the actual field before submitting', () => {
    const valid = { bankName: 'Ngân hàng A', accountNumber: '00123456', accountName: 'NGUYỄN VĂN A' };
    assert.match(validateBankAccount({ ...valid, accountNumber: '0012/3456' }), /^Số tài khoản/);
    assert.match(validateBankAccount({ ...valid, bankName: '' }), /^Tên ngân hàng/);
    assert.match(validateBankAccount({ ...valid, accountName: '' }), /^Tên chủ tài khoản/);
    assert.match(validateBankAccount(normalizeBankAccount({})), /^Tên ngân hàng/);
});
