import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Notification from '../Notification';
import styled from 'styled-components';
import { useState } from 'react';

// アラートコンポーネントをまとめたサンプル用のコンポーネント
const AlertExamples: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(true);
  const [showError, setShowError] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  return (
    <AlertContainer>
      <h1>アラート・通知コンポーネント例</h1>
      
      <Section>
        <h2>基本的なアラート</h2>
        
        <AlertGroup>
          {showSuccess && (
            <Notification
              type="success"
              title="成功"
              message="操作が正常に完了しました。"
              onClose={() => setShowSuccess(false)}
            />
          )}
          
          {showError && (
            <Notification
              type="error"
              title="エラー"
              message="処理中にエラーが発生しました。もう一度お試しください。"
              onClose={() => setShowError(false)}
            />
          )}
          
          {showWarning && (
            <Notification
              type="warning"
              title="警告"
              message="入力内容を確認してください。"
              onClose={() => setShowWarning(false)}
            />
          )}
          
          {showInfo && (
            <Notification
              type="info"
              title="お知らせ"
              message="システムメンテナンスが明日予定されています。"
              onClose={() => setShowInfo(false)}
            />
          )}
        </AlertGroup>
        
        <ButtonGroup>
          <Button onClick={() => setShowSuccess(true)}>成功アラート表示</Button>
          <Button onClick={() => setShowError(true)}>エラーアラート表示</Button>
          <Button onClick={() => setShowWarning(true)}>警告アラート表示</Button>
          <Button onClick={() => setShowInfo(true)}>情報アラート表示</Button>
        </ButtonGroup>
      </Section>
      
      <Section>
        <h2>アラートダイアログ</h2>
        
        <ButtonGroup>
          <Button onClick={() => setShowDialog(true)}>アラートダイアログを開く</Button>
        </ButtonGroup>
        
        {showDialog && (
          <Notification
            type="warning"
            title="確認ダイアログ"
            message="この操作は取り消せません。続行しますか？"
            mode="dialog"
            onClose={() => setShowDialog(false)}
          >
            <DialogActions>
              <ActionButton $primary onClick={() => {
                alert('操作を実行しました');
                setShowDialog(false);
              }}>
                続行する
              </ActionButton>
              <ActionButton onClick={() => setShowDialog(false)}>
                キャンセル
              </ActionButton>
            </DialogActions>
          </Notification>
        )}
      </Section>

      <Section>
        <h2>その他のアラートスタイル</h2>
        
        <SubSection>
          <h3>タイトルなしアラート</h3>
          <Notification
            type="info"
            message="タイトルのないシンプルなアラートメッセージです。"
          />
        </SubSection>
        
        <SubSection>
          <h3>閉じるボタンなしアラート</h3>
          <Notification
            type="info"
            title="永続的な通知"
            message="このアラートには閉じるボタンがありません。"
            showCloseButton={false}
          />
        </SubSection>
        
        <SubSection>
          <h3>アクション付きアラート</h3>
          <Notification
            type="warning"
            title="更新情報"
            message="新しいバージョンが利用可能です。"
          >
            <ActionButton $primary onClick={() => alert('更新を開始します')}>
              今すぐ更新
            </ActionButton>
            <ActionButton onClick={() => alert('更新を保留しました')}>
              後で
            </ActionButton>
          </Notification>
        </SubSection>
      </Section>
    </AlertContainer>
  );
};

// スタイル付きコンポーネント
const AlertContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
  
  h1 {
    margin-bottom: 24px;
  }
`;

const Section = styled.section`
  margin-bottom: 40px;
  
  h2 {
    margin-bottom: 16px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }
`;

const SubSection = styled.div`
  margin-bottom: 24px;
  
  h3 {
    margin-bottom: 12px;
  }
`;

const AlertGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #3182CE;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2B6CB0;
  }
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background-color: #3182CE;
    color: white;
    border: none;
    
    &:hover {
      background-color: #2B6CB0;
    }
  ` : `
    background-color: transparent;
    color: #333;
    border: 1px solid #ccc;
    
    &:hover {
      background-color: #f2f2f2;
    }
  `}
`;

const meta: Meta<typeof AlertExamples> = {
  title: 'Molecules/AlertExamples',
  component: AlertExamples,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AlertExamples>;

export const Default: Story = {};
