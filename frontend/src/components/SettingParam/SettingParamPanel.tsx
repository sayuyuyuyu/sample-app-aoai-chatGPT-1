import { useContext, useState } from 'react'
import React from 'react'
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
} from '@fluentui/react'
import { useBoolean } from '@fluentui/react-hooks'

import { AppStateContext } from '../../state/AppProvider'

import styles from './SettingParamPanel.module.css'

interface SettingParamPanelProps { }

const commandBarStyle: ICommandBarStyles = {
  root: {
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  }
}

const commandBarButtonStyle: Partial<IStackStyles> = { root: { height: '50px' } }

export function SettingParamPanel(_props: SettingParamPanelProps) {
  const appStateContext = useContext(AppStateContext)
  const [showContextualMenu, setShowContextualMenu] = React.useState(false)
  const [hideClearAllDialog, { toggle: toggleClearAllDialog }] = useBoolean(true)
  const [clearing, setClearing] = React.useState(false)
  const [clearingError, setClearingError] = React.useState(false)

  // 各種パラメータの状態
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
  const [dataResponseLimitEnabled, setDataResponseLimitEnabled] = useState(false);
  const [topK, setTopK] = useState(5);
  const [strictness, setStrictness] = useState(1);

  const menuItems: IContextualMenuItem[] = [
    { key: 'clearAll', text: 'Reset all settings', iconProps: { iconName: 'Delete' } }
  ]

  const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault() // don't navigate
    setShowContextualMenu(true)
  }, [])

  const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), [])

  const handleSettingClick = () => {
    appStateContext?.dispatch({ type: 'TOGGLE_SETTING' })
  }


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

  React.useEffect(() => { }, [appStateContext?.state.isSettingOpen, clearingError])

  return (
    <section className={styles.container} data-is-scrollable aria-label={'setting parameter panel'}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" wrap aria-label="setting parameter header">
        <StackItem>
          <Text
            role="heading"
            aria-level={2}
            style={{
              alignSelf: 'center',
              fontWeight: '600',
              fontSize: '18px',
              marginRight: 'auto',
              paddingLeft: '20px'
            }}>
            Settings
          </Text>
        </StackItem>
        <Stack verticalAlign="start">
          <Stack horizontal styles={commandBarButtonStyle}>
            <ContextualMenu
              items={menuItems}
              hidden={!showContextualMenu}
              target={'#moreButton'}
              onItemClick={toggleClearAllDialog}
              onDismiss={onHideContextualMenu}
            />
            <CommandBarButton
              iconProps={{ iconName: 'Cancel' }}
              title={'Hide'}
              onClick={handleSettingClick}
              aria-label={'hide button'}
              styles={commandBarStyle}
              role="button"
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack
        aria-label="setting parameter panel content"
        styles={{
          root: {
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            paddingTop: '2.5px',
            maxWidth: '100%'
          }
        }}
        style={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
          flexWrap: 'wrap',
          padding: '1px'
        }}>
        <Stack className={styles.settingParamListContainer}>
          <TextField
            label="Temperature"
            type="number"
            value={temperature.toFixed(2)}  // 小数点以下2桁まで表示
            onChange={(e, newValue) => {
              const value = parseFloat(newValue || '0');
              setTemperature(Math.min(Math.max(value, 0), 1));  // 範囲を0-1に制限
            }}
            step={0.01}  // 小数点以下2桁まで入力可能
            min={0}
            max={1}
          />
          <Text variant="small">モデル応答の創造性を調整する（0～1）。</Text>

          <TextField
            label="Top P"
            type="number"
            value={topP.toFixed(2)}  // 小数点以下2桁まで表示
            onChange={(e, newValue) => {
              const value = parseFloat(newValue || '0');
              setTopP(Math.min(Math.max(value, 0.1), 1));  // 範囲を0.1-1に制限
            }}
            step={0.01}  // 小数点以下2桁まで入力可能
            min={0.1}
            max={1}
          />
          <Text variant="small">モデルによって生成されるトークンの確率を制限する (0.1 から 1)。</Text>

          <Checkbox
            label="AI Search Enabled"
            checked={aiSearchEnabled}
            onChange={(e, newValue) => setAiSearchEnabled(newValue || false)}
          />
          <Text variant="small">AI検索機能を使用するかどうかを切り替える。</Text>

          {aiSearchEnabled && ( // AI Search Enabled がチェックされている場合のみ表示
            <>
              <TextField
                label="Search Target TOP_K"
                type="number"
                value={topK.toString()}
                onChange={(e, newValue) => setTopK(Math.max(parseInt(newValue || '0'), 0))}
                min={0}
                max={50}
              />
              <Text variant="small">上位何件を検索結果とする数を指定する。</Text>

              <Checkbox
                label="Data Response Limit Enabled"
                checked={dataResponseLimitEnabled}
                onChange={(e, newValue) => setDataResponseLimitEnabled(newValue || false)}
              />
              <Text variant="small">データ応答を制限するかどうかを切り替える。</Text>

              {dataResponseLimitEnabled && (
                <>
                  <Text variant="small">Search Strictness</Text>
                  <Slider
                    label="Search Strictness"
                    min={1}
                    max={5}
                    value={strictness}
                    onChange={setStrictness}
                    showValue={true}
                  />
                  <Text variant="small">検索の厳密さを設定します。(1~5)</Text>
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
      <PrimaryButton onClick={saveSettings} text="Save Settings" />
    </section>
  )
}