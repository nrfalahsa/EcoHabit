import React, { useState, useRef, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { authFetch, uploadToCatbox } from '../../services/api';
import Modal from '../common/Modal';

const FaIcon = ({ iconName, style = {} }) => (
  <span 
    className="fa-icon-wrapper" 
    style={{
      width: '1.25rem',
      height: '1.25rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.75rem',
      verticalAlign: 'middle',
      ...style
    }}
  >
    <i className={`fa-solid ${iconName}`}></i>
  </span>
);

function Header() {
  const { user, logout, theme, toggleTheme, updateUserState } = useContext(AuthContext);
  const { showToast } = useToast();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeModal, setActiveModal] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    newName: '',
    newEmail: '',
  });
  const dropdownRef = useRef(null);
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

  const getAvatarSrc = () => {
    if (user && user.profilePicture) {
      return user.profilePicture;
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem('ecohabit_user'));
      if (storedUser && storedUser.profilePicture) {
        return storedUser.profilePicture;
      }
    } catch (e) {
      console.error("Error parsing stored user for avatar", e);
    }
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=4CAF50&color=fff`;
  };

  const avatarSrc = getAvatarSrc();

  const handleConfirmLogout = () => {
    logout(); 
    closeModal();
  };

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      showToast('Mengupload gambar...', 'info');
      
      const imageUrl = await uploadToCatbox(file);
      
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
            <img src="/favicon/logo.png" alt="EcoHabit Logo" className="header-logo-img" />
            <span>EcoHabit</span>
          </div>

          <div className="user-menu" ref={dropdownRef}>
            <div className="user-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className="user-name-display">Halo, {user?.name || 'Pengguna'}</span>
              <img src={avatarSrc} alt="Profile" className="profile-pic" />
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {activeSubmenu !== 'settings' && (
                  <>
                    <div className="dropdown-item has-submenu" onClick={() => setActiveSubmenu('settings')}>
                      <FaIcon iconName="fa-gear" /> Pengaturan <i className="fa-solid fa-chevron-right fa-arrow-right-custom"></i>
                    </div>
                    <div className="dropdown-item" onClick={toggleTheme}>
                      {theme === 'light' ? (
                        <>
                          <FaIcon iconName="fa-moon" /> Mode Gelap
                        </>
                      ) : (
                        <>
                          <FaIcon iconName="fa-sun" style={{ color: '#FFD700' }} /> Mode Terang
                        </>
                      )}
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item danger" onClick={() => openModal('logout')}>
                      <FaIcon iconName="fa-right-from-bracket" /> Logout
                    </div>
                  </>
                )}

                {activeSubmenu === 'settings' && (
                  <div className="submenu-slide">
                    <div className="dropdown-header" onClick={() => setActiveSubmenu(null)}>
                      <i className="fa-solid fa-chevron-left" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}></i> Kembali
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('password')}>
                      <FaIcon iconName="fa-key" /> Ganti Sandi
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('name')}>
                      <FaIcon iconName="fa-pen-to-square" /> Ganti Nama
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('email')}>
                      <FaIcon iconName="fa-envelope" /> Ganti Email
                    </div>
                    <div className="dropdown-item" onClick={() => openModal('photo')}>
                      <FaIcon iconName="fa-image" /> Ganti Foto Profil
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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

      <Modal isOpen={activeModal === 'photo'} onClose={closeModal} title="Ganti Foto Profil">
        <div className="upload-modal-container">
          <img src={avatarSrc} alt="Preview" className="profile-preview-img" />

          <p style={{marginBottom: '1rem', fontWeight: '500'}}>
            Pilih foto baru (JPG/PNG)
          </p>

          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display: 'none'}} id="photo-upload" />

          <label htmlFor="photo-upload" className={`btn btn-primary file-upload-btn ${isLoading ? 'loading' : ''}`}>
            {isLoading ? 'Mengupload...' : 'Pilih File'}
          </label>

          <p className="upload-helper-text">Powered by Catbox.moe</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'logout'} onClose={closeModal} title="Konfirmasi Logout">
        <div className="text-center">
          <p className="logout-confirmation-text">Apakah Anda yakin ingin keluar dari aplikasi?</p>
          <div className="modal-actions">
            <button onClick={closeModal} className="btn btn-secondary">Batal</button>
            <button onClick={handleConfirmLogout} className="btn btn-danger">Ya, Keluar</button>
          </div>
        </div>
      </Modal>

    </header>
  );
}

export default Header;