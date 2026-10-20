import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight, X, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import NovastayLogo from '../components/NovastayLogo';

const TenantRegister = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const API_ROOT = import.meta.env.VITE_API_URL || '';

  // Password strength check
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, text: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, text: 'Yếu', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, text: 'Trung bình', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, text: 'Khá', color: 'bg-yellow-400' };
    if (score <= 4) return { level: 4, text: 'Mạnh', color: 'bg-emerald-400' };
    return { level: 5, text: 'Rất mạnh', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_ROOT}/api/auth/resident/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FullName: fullName.trim(),
          Phone: phone.trim(),
          Email: email.trim(),
          Password: password
        }),
      });

      if (!res.ok) {
        let message = 'Đăng ký thất bại. Vui lòng thử lại.';
        try {
          const body = await res.json();
          message = body?.message || body?.error || message;
        } catch (_) { }
        throw new Error(message);
      }

      const data = await res.json();

      // Lưu thông tin vào localStorage
      localStorage.setItem('ns_account', JSON.stringify({
        accountId: data.accountId,
        residentId: data.residentId,
        organizationId: null,
        accountType: data.accountType,
        customerName: data.name,
        name: data.name,
        phone: data.phone,
}