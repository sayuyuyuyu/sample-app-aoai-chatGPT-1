import { useContext, useState, useEffect } from 'react';
import React from 'react';
import {
  CommandBarButton,
  ContextualMenu,
  ICommandBarStyles,
  IContextualMenuItem,
  IStackStyles,
  PrimaryButton,
  Slider,
  Stack,
  StackItem,
  Text,
  TextField,
  Checkbox
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

import { AppStateContext } from '../../state/AppProvider';
import styles from './SettingParamPanel.module.css';

interface SettingParamPanelProps { }

const commandBarStyle: ICommandBarStyles = {
  root: {
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  }
};

const commandBarButtonStyle: Partial<IStackStyles> = { root: { height: '50px' } };

export function SettingParamPanel(_props: SettingParamPanelProps) {
  const appStateContext = useContext(AppStateContext);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [hideClearAllDialog, { toggle: toggleClearAllDialog }] = useBoolean(true);
  const [clearing, setClearing] = React.useState(false);
  const [clearingError, setClearingError] = React.useState(false);

  // 各種パラメータの状態
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
  const [dataResponseLimitEnabled, setDataResponseLimitEnabled] = useState(false);
  const [topK, setTopK] = useState(5);
  const [strictness, setStrictness] = useState(1);

  const menuItems: IContextualMenuItem[] = [
    { key: 'clearAll', text: 'Reset all settings', iconProps: { iconName: 'Delete' } }
  ];

  const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault(); // don't navigate
    setShowContextualMenu(true);
  }, []);

  const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), []);

  const handleSettingClick = () => {
    appStateContext?.dispatch({ type: 'TOGGLE_SETTING' });
  };

  const saveSettings = async () => {
    const settings = {
      temperature,
      topP,
      aiSearchEnabled,
      dataResponseLimitEnabled,
      topK,
      strictness
    };

    try {
      const response = await fetch('/api/save-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      alert('設定を更新しました。');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  return (
    <section className={styles.container} data-is-scrollable aria-label={'setting parameter panel'}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" wrap aria-label="setting parameter header" styles={{ root: { marginBottom: '20px' } }}>
        <StackItem>
          <Text role="heading" aria-level={2} style={{ fontWeight: '600', fontSize: '18px', paddingLeft: '20px' }}>
            Settings
          </Text>
        </StackItem>
      </Stack>
      <Stack aria-label="setting parameter panel content" styles={{ root: { padding: '0 20px' } }}>
        <Stack className={styles.settingParamListContainer} styles={{ root: { marginBottom: '20px' } }}>
          <TextField
            label="Temperature"
            type="number"
            value={temperature.toFixed(2)} // 小数点以下2桁まで表示
            onChange={(e, newValue) => {
              const value = parseFloat(newValue || '0');
              setTemperature(Math.min(Math.max(value, 0), 2)); // 範囲を0-2に制限
            }}
            step={0.01} // 小数点以下2桁まで入力可能
            min={0}
            max={2}
            styles={{ root: { marginBottom: '10px' } }}
          />
          <Text variant="small" styles={{ root: { marginBottom: '15px' } }}>
            モデル応答の創造性を調整します。（0～2）
          </Text>

          <TextField
            label="Top P"
            type="number"
            value={topP.toFixed(2)} // 小数点以下2桁まで表示
            onChange={(e, newValue) => {
              const value = parseFloat(newValue || '0');
              setTopP(Math.min(Math.max(value, 0.1), 1)); // 範囲を0.1-1に制限
            }}
            step={0.01} // 小数点以下2桁まで入力可能
            min={0.1}
            max={1}
            styles={{ root: { marginBottom: '10px' } }}
          />
          <Text variant="small" styles={{ root: { marginBottom: '15px' } }}>
            モデルによって生成されるトークンの確率を制限します。 (0.1～1)
          </Text>

          <Checkbox
            label="AI Search Enabled"
            checked={aiSearchEnabled}
            onChange={(e, newValue) => setAiSearchEnabled(newValue || false)}
            styles={{ root: { marginBottom: '10px' } }}
          />
          <Text variant="small" styles={{ root: { marginBottom: '15px' } }}>
            AI検索機能を使用する場合はチェックしてください。
          </Text>

          {aiSearchEnabled && ( // AI Search Enabled がチェックされている場合のみ表示
            <>
              <Slider
                label="Search Target TOP_K"
                min={1}
                max={50}
                value={topK}
                onChange={setTopK}
                showValue={true}
                styles={{ root: { marginBottom: '10px' } }}
              />
              <Text variant="small" styles={{ root: { marginBottom: '15px' } }}>
                上位何件を検索結果とするか指定します。
              </Text>

              <Checkbox
                label="Data Response Limit Enabled"
                checked={dataResponseLimitEnabled}
                onChange={(e, newValue) => setDataResponseLimitEnabled(newValue || false)}
                styles={{ root: { marginBottom: '10px' } }}
              />
              <Text variant="small" styles={{ root: { marginBottom: '15px' } }}>
                独自データのみの応答に制限する場合はチェックします。
              </Text>

              {dataResponseLimitEnabled && (
                <>
                  <Slider
                    label="Search Strictness"
                    min={1}
                    max={5}
                    value={strictness}
                    onChange={setStrictness}
                    showValue={true}
                    styles={{ root: { marginBottom: '10px' } }}
                  />
                  <Text variant="small">検索の厳密さを設定します。(1~5)</Text>
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
      <PrimaryButton onClick={saveSettings} text="Save Settings" styles={{ root: { margin: '20px' } }} />
    </section>
  );
}