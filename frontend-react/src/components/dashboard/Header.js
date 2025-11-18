// src/components/dashboard/Header.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { authFetch, uploadToCatbox } from '../../services/api';
import Modal from '../common/Modal';

// Pastikan file CSS ini ada (seperti yang dibuat sebelumnya)
import '../../assets/header.css'; 

function Header() {
  const { user, logout, theme, toggleTheme, updateUserState } = useContext(AuthContext);
  const { showToast } = useToast();
  
  // State untuk Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // State untuk Modal (termasuk 'logout')
  const [activeModal, setActiveModal] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    newName: '',
    newEmail: '',
  });

  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setActiveSubmenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Reset form saat modal dibuka
  const openModal = (type) => {
    setActiveModal(type);
    setFormData({
      currentPassword: '',
      newPassword: '',
      newName: user?.name || '',
      newEmail: user?.email || ''
    });
    setIsDropdownOpen(false); 
  };

  const closeModal = () => {
    setActiveModal(null);
    setIsLoading(false);
  };

  // --- LOGIKA AVATAR (DIPERBAIKI) ---
  // Mengambil foto profil dengan prioritas: State -> LocalStorage -> Default
  const getAvatarSrc = () => {
    // 1. Cek di state Context (paling update)
    if (user && user.profilePicture) {
      return user.profilePicture;
    }
    
    // 2. Fallback ke LocalStorage (jika state belum siap sesaat setelah login)
    try {
      const storedUser = JSON.parse(localStorage.getItem('ecohabit_user'));
      if (storedUser && storedUser.profilePicture) {
        return storedUser.profilePicture;
      }
    } catch (e) {
      console.error("Error parsing stored user for avatar", e);
    }

    // 3. Default Avatar (UI Avatars)
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=4CAF50&color=fff`;
  };

  const avatarSrc = getAvatarSrc();

  // --- HANDLERS ---

  // Handler Konfirmasi Logout
  const handleConfirmLogout = () => {
    logout(); 
    closeModal();
  };

  // Handler Update Nama/Email
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const body = {};
      if (activeModal === 'name') body.name = formData.newName;
      if (activeModal === 'email') body.email = formData.newEmail;

      const updatedUser = await authFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      updateUserState(updatedUser);
      showToast(`Berhasil mengubah ${activeModal === 'name' ? 'nama' : 'email'}`, 'success');
      closeModal();
    } catch (error) {
      showToast(error.message || 'Gagal memperbarui profil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Ganti Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authFetch('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      showToast('Password berhasil diubah', 'success');
      closeModal();
    } catch (error) {
      showToast(error.message || 'Gagal mengubah password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Upload Foto
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      showToast('Mengupload gambar...', 'info');
      
      // 1. Upload ke Catbox
      const imageUrl = await uploadToCatbox(file);
      
      // 2. Simpan URL ke Backend Database
      const updatedUser = await authFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ profilePicture: imageUrl })
      });

      updateUserState(updatedUser);
      showToast('Foto profil berhasil diubah', 'success');
      closeModal();
    } catch (error) {
      showToast(error.message || 'Gagal upload foto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img 
              src="/favicon/logo.png" 
              alt="EcoHabit Logo" 
              className="header-logo-img" 
            />
            <span>EcoHabit</span>
          </div>
          
          <div className="user-menu" ref={dropdownRef}>
            <div className="user-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className="user-name-display">Halo, {user?.name || 'Pengguna'}</span> 
              <img src={avatarSrc} alt="Profile" className="profile-pic" />
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {/* MENU UTAMA */}
                {activeSubmenu !== 'settings' && (
                  <>
                    <div className="dropdown-item has-submenu" onClick={() => setActiveSubmenu('settings')}>
                      ⚙️ Pengaturan <span>›</span>
                    </div>
                    <div className="dropdown-item" onClick={toggleTheme}>
                      {theme === 'light' ? '🌙 Mode Gelap' : '☀️ Mode Terang'}
                    </div>
                    <div className="dropdown-divider"></div>
                    {/* Memicu Modal Konfirmasi Logout */}
                    <div className="dropdown-item danger" onClick={() => openModal('logout')}>
                      🚪 Logout
                    </div>
                  </>
                )}

                {/* SUBMENU PENGATURAN */}
                {activeSubmenu === 'settings' && (
                  <>
                    <div className="dropdown-header" onClick={() => setActiveSubmenu(null)}>
                      <span>‹</span> Kembali
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('password')}>
                      🔑 Ganti Sandi
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('name')}>
                      📝 Ganti Nama
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('email')}>
                      📧 Ganti Email
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('photo')}>
                      🖼️ Ganti Foto Profil
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Modal Ganti Nama */}
      <Modal isOpen={activeModal === 'name'} onClose={closeModal} title="Ganti Nama">
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Nama Baru</label>
            <input type="text" name="newName" className="form-input" value={formData.newName} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      {/* Modal Ganti Email */}
      <Modal isOpen={activeModal === 'email'} onClose={closeModal} title="Ganti Email">
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Email Baru</label>
            <input type="email" name="newEmail" className="form-input" value={formData.newEmail} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      {/* Modal Ganti Password */}
      <Modal isOpen={activeModal === 'password'} onClose={closeModal} title="Ganti Password">
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Password Saat Ini</label>
            <input type="password" name="currentPassword" className="form-input" value={formData.currentPassword} onChange={handleInputChange} required placeholder="Masukkan password lama" />
             <div className="forgot-password-wrapper">
              <a href="/forgot-password" className="forgot-password-link">Lupa password?</a>
            </div>
          </div>
          <div className="form-group">
            <label>Password Baru</label>
            <input type="password" name="newPassword" className="form-input" value={formData.newPassword} onChange={handleInputChange} required minLength={6} placeholder="Masukkan password baru" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </Modal>

      {/* Modal Ganti Foto (Dengan Tombol Simetris) */}
      <Modal isOpen={activeModal === 'photo'} onClose={closeModal} title="Ganti Foto Profil">
        <div className="upload-modal-container">
          <img src={avatarSrc} alt="Preview" className="profile-preview-img" />
          
          <p style={{marginBottom: '1rem', fontWeight: '500'}}>
            Pilih foto baru (JPG/PNG)
          </p>

          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display: 'none'}} id="photo-upload" />
          
          {/* Class 'file-upload-btn' diambil dari header.css untuk style simetris */}
          <label htmlFor="photo-upload" className={`btn btn-primary file-upload-btn ${isLoading ? 'loading' : ''}`}>
            {isLoading ? 'Mengupload...' : 'Pilih File'}
          </label>
          
          <p className="upload-helper-text">Powered by Catbox.moe</p>
        </div>
      </Modal>

      {/* Modal Konfirmasi Logout */}
      <Modal isOpen={activeModal === 'logout'} onClose={closeModal} title="Konfirmasi Logout">
        <div className="text-center">
          <p className="logout-confirmation-text">
            Apakah Anda yakin ingin keluar dari aplikasi?
          </p>
          <div className="modal-actions">
            <button onClick={closeModal} className="btn btn-secondary">
              Batal
            </button>
            <button onClick={handleConfirmLogout} className="btn btn-danger">
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>

    </header>
  );
}

export default Header;