import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleCalendar } from './ScheduleCalendar';
import { mockCalendarEvents } from '../../../mocks/calendar';
import { format } from 'date-fns';

describe('ScheduleCalendar', () => {
  const testDate = new Date('2025-05-12T10:00:00');
  
  test('renders calendar with correct title', () => {
    render(
      <ScheduleCalendar
        events={mockCalendarEvents}
        initialDate={testDate}
        initialView="week"
      />
    );
    
    // 週表示での日付タイトルが正しく表示されることを確認
    expect(screen.getByText(/2025年5月 12〜18日/)).toBeInTheDocument();
  });

  test('changes view when view type is changed', () => {
    const onViewChangeMock = jest.fn();
    render(
      <ScheduleCalendar
        events={mockCalendarEvents}
        initialDate={testDate}
        initialView="week"
        onViewChange={onViewChangeMock}
      />
    );
    
    // ビュー切替ボタンをクリック
    fireEvent.click(screen.getByText('週表示'));
    
    // メニューから「月表示」を選択
    fireEvent.click(screen.getByText('月表示'));
    
    // onViewChangeが呼ばれたことを確認
    expect(onViewChangeMock).toHaveBeenCalledWith('month');
  });

  test('shows loading state', () => {
    render(
      <ScheduleCalendar
        events={[]}
        isLoading={true}
        initialDate={testDate}
      />
    );
    
    // ローディング表示が出ることを確認
    expect(screen.getByText('スケジュールを読み込み中...')).toBeInTheDocument();
  });

  test('navigates to previous and next period', () => {
    const onDateChangeMock = jest.fn();
    render(
      <ScheduleCalendar
        events={mockCalendarEvents}
        initialDate={testDate}
        initialView="day"
        onDateChange={onDateChangeMock}
      />
    );
    
    // 前へボタンをクリック
    fireEvent.click(screen.getByLabelText('Previous'));
    
    // 日表示モードでは前日になるはずなので、1回目のコールのパラメータを確認
    expect(onDateChangeMock).toHaveBeenCalled();
    const firstCallDate = onDateChangeMock.mock.calls[0][0];
    expect(format(firstCallDate, 'yyyy-MM-dd')).toBe('2025-05-11');
    
    // 次へボタンをクリック
    fireEvent.click(screen.getByLabelText('Next'));
    
    // 2回目のコールでは元の日付に戻るはず
    expect(onDateChangeMock).toHaveBeenCalledTimes(2);
    const secondCallDate = onDateChangeMock.mock.calls[1][0];
    expect(format(secondCallDate, 'yyyy-MM-dd')).toBe('2025-05-12');
  });

  test('calls onEventClick when an event is clicked', () => {
    const onEventClickMock = jest.fn();
    render(
      <ScheduleCalendar
        events={[{
          id: 'test-event',
          title: 'テストイベント',
          start: '2025-05-12T10:00:00Z',
          end: '2025-05-12T12:00:00Z',
          type: 'task',
        }]}
        initialDate={testDate}
        initialView="day"
        onEventClick={onEventClickMock}
      />
    );
    
    // イベントをクリック
    const event = screen.getByText('テストイベント');
    fireEvent.click(event);
    
    // onEventClickが呼ばれたことを確認
    expect(onEventClickMock).toHaveBeenCalled();
    expect(onEventClickMock.mock.calls[0][0].id).toBe('test-event');
  });

  test('goes to today when today button is clicked', () => {
    const onDateChangeMock = jest.fn();
    render(
      <ScheduleCalendar
        events={mockCalendarEvents}
        initialDate={new Date('2024-01-01')} // 明らかに今日ではない日付
        onDateChange={onDateChangeMock}
      />
    );
    
    // 今日ボタンをクリック
    fireEvent.click(screen.getByText('今日'));
    
    // onDateChangeが現在の日付で呼び出されたことを確認
    expect(onDateChangeMock).toHaveBeenCalled();
    const today = new Date();
    const calledWithDate = onDateChangeMock.mock.calls[0][0];
    
    // 同じ日付であることを確認（時間は無視）
    expect(calledWithDate.getFullYear()).toBe(today.getFullYear());
    expect(calledWithDate.getMonth()).toBe(today.getMonth());
    expect(calledWithDate.getDate()).toBe(today.getDate());
  });
});
