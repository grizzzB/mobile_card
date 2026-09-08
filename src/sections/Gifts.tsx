import { useState } from 'react';
import { useScrollFade } from '../hooks/useScrollFade';
import { useUI } from '../context/UIContext';
import styles from './Gifts.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';
import type { Person } from '../utils/types';

type AccountItem = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  relation: string;
  kakaopayUrl?: string;
};

const buildAccounts = (
  person: Person,
  relationLabel: string,
): AccountItem[] => {
  if (!person.bank) return [];
  return [{
    bankName: person.bank.name,
    accountNumber: person.bank.accountNumber,
    accountHolder: person.name,
    relation: relationLabel,
    kakaopayUrl: person.bank.kakaoPayUrl,
  }];
};

const groomAccounts: AccountItem[] = [
  ...buildAccounts(WEDDING_CONFIG.groom.self, '신랑'),
  ...buildAccounts(WEDDING_CONFIG.groom.father, '신랑 아버지'),
  ...buildAccounts(WEDDING_CONFIG.groom.mother, '신랑 어머니'),
];

const brideAccounts: AccountItem[] = [
  ...buildAccounts(WEDDING_CONFIG.bride.self, '신부'),
  ...buildAccounts(WEDDING_CONFIG.bride.father, '신부 아버지'),
  ...buildAccounts(WEDDING_CONFIG.bride.mother, '신부 어머니'),
];

function AccountGroup({ label, accounts }: { label: string; accounts: AccountItem[] }) {
  const [open, setOpen] = useState(false);
  const { showToast } = useUI();

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(`${accountNumber.replaceAll('-', '')}`);
    showToast('복사가 완료되었습니다', 'success');
  };

  return (
    <div className={styles.group}>
      <button className={styles.groupToggle} onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <span className={styles.toggleIcon}>{open ? '∧' : '∨'}</span>
      </button>

      {open && (
        <div className={styles.accountList}>
          {accounts.map((acc, i) => (
            <div key={i} className={styles.accountRow}>
              <div className={styles.accountInfo}>
                <span className={styles.accountHolder}>{acc.accountHolder}</span>
                <span className={styles.accountRelation}>{acc.relation}</span>
                <span className={styles.accountBank}>{acc.bankName} {acc.accountNumber}</span>
              </div>
              <div className={styles.accountActions}>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopy(acc.accountNumber)}
                >
                  복사
                </button>
                {acc.kakaopayUrl && (
                  <a
                    href={acc.kakaopayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.kakaoBtn}
                  >
                    카카오페이
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Gifts() {
  const ref = useScrollFade();

  return (
    <section ref={ref} className={styles.giftsSection}>
      <div className={styles.container}>
        <div className="section-header">
          <h2 className={styles.title}>ACCOUNT</h2>
          <p className={styles.subtitle}>마음 전하실 곳</p>
        </div>
        <p className={styles.description}>
          참석이 어려우신 분들을 위해<br />
          계좌번호를 기재하였습니다.<br />
          너그러운 마음으로 양해 부탁드립니다.
        </p>

        <div className={styles.groups}>
          <AccountGroup label="신랑측" accounts={groomAccounts} />
          <AccountGroup label="신부측" accounts={brideAccounts} />
        </div>
      </div>
    </section>
  );
}
