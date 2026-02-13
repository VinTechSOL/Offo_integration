import React from 'react';
import Modal from '../common/Modal.tsx';
import Button from '../common/Button.tsx';
import { constants } from '../../constants.ts';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Logout</Button>
      </>
    }>
      <p className={`text-${constants.colors.ACCENT_GRAY}`}>Are you sure you want to log out?</p>
    </Modal>
  );
};

export default LogoutModal;