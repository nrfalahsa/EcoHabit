// src/components/dashboard/Header.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { authFetch, uploadToCatbox } from '../../services/api';
import Modal from '../common/Modal';

function Header() {
  const { user, logout, theme, toggleTheme, updateUserState } = useContext(AuthContext);
  const { showToast } = useToast();
  
  // State untuk Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null); // 'settings' atau null

  // State untuk Modal
  const [activeModal, setActiveModal] = useState(null); // 'password', 'name', 'email', 'photo', null
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
      showToast('Profil berhasil diperbarui', 'success');
      closeModal();
    } catch (error) {
      showToast(error.message, 'error');
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
      showToast(error.message, 'error');
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
      
      // 2. Simpan URL ke Backend
      const updatedUser = await authFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ profilePicture: imageUrl })
      });

      updateUserState(updatedUser);
      showToast('Foto profil berhasil diubah', 'success');
      closeModal();
    } catch (error) {
      showToast('Gagal upload foto: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type) => {
    setActiveModal(type);
    setFormData({
      currentPassword: '',
      newPassword: '',
      newName: user.name,
      newEmail: user.email
    });
    setIsDropdownOpen(false); // Tutup dropdown saat modal buka
  };

  const closeModal = () => setActiveModal(null);

  // Default Avatar jika user belum punya foto
  const avatarSrc = user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=4CAF50&color=fff`;

  return (
    <header className="dashboard-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">EcoHabit</div>
          
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
                    <div 
                      className="dropdown-item has-submenu"
                      onClick={() => setActiveSubmenu('settings')}
                    >
                      ⚙️ Pengaturan <span>›</span>
                    </div>
                    <div className="dropdown-item" onClick={toggleTheme}>
                      {theme === 'light' ? '🌙 Mode Gelap' : '☀️ Mode Terang'}
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item danger" onClick={logout}>
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

      {/* MODALS */}
      
      {/* Modal Ganti Nama */}
      <Modal isOpen={activeModal === 'name'} onClose={closeModal} title="Ganti Nama">
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Nama Baru</label>
            <input 
              type="text" 
              name="newName" 
              className="form-input"
              value={formData.newName} 
              onChange={handleInputChange} 
              required 
            />
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
            <input 
              type="email" 
              name="newEmail" 
              className="form-input"
              value={formData.newEmail} 
              onChange={handleInputChange} 
              required 
            />
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
            <input 
              type="password" 
              name="currentPassword" 
              className="form-input"
              value={formData.currentPassword} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password Baru</label>
            <input 
              type="password" 
              name="newPassword" 
              className="form-input"
              value={formData.newPassword} 
              onChange={handleInputChange} 
              required 
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </Modal>

      {/* Modal Ganti Foto */}
      <Modal isOpen={activeModal === 'photo'} onClose={closeModal} title="Ganti Foto Profil">
        <div className="text-center">
          <img 
            src={avatarSrc} 
            alt="Preview" 
            style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem'}} 
          />
          <p style={{marginBottom: '1rem'}}>Pilih foto baru (JPG/PNG)</p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload}
            style={{display: 'none'}}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="btn btn-primary" style={{cursor: isLoading ? 'wait' : 'pointer'}}>
            {isLoading ? 'Mengupload...' : 'Pilih File'}
          </label>
          <p style={{fontSize: '0.8rem', marginTop: '0.5rem', color: '#6c757d'}}>
            Powered by Catbox.moe
          </p>
        </div>
      </Modal>

    </header>
  );
}

export default Header;