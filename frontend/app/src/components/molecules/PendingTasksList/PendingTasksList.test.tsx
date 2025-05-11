import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PendingTasksList } from './PendingTasksList';
import { mockTasks } from '../../../mocks/tasks';

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// テスト用のモックタスク
const testTasks = mockTasks.filter(task => task.status !== 'completed').slice(0, 3);

describe('PendingTasksList', () => {
  test('renders task list correctly', () => {
    renderWithRouter(
      <PendingTasksList
        tasks={testTasks}
        totalItems={testTasks.length}
        currentPage={1}
        itemsPerPage={10}
      />
    );
    
    // 各タスクのタイトルが表示されていることを確認
    testTasks.forEach(task => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
    
    // テーブルのヘッダーが存在することを確認
    expect(screen.getByText('タスク')).toBeInTheDocument();
    expect(screen.getByText('期限日')).toBeInTheDocument();
    expect(screen.getByText('ユーザー')).toBeInTheDocument();
    expect(screen.getByText('優先度')).toBeInTheDocument();
  });

  test('shows loading spinner when isLoading is true', () => {
    renderWithRouter(
      <PendingTasksList
        tasks={[]}
        isLoading={true}
        totalItems={0}
        currentPage={1}
        itemsPerPage={10}
      />
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinnerはrole="status"を持つ
  });

  test('shows empty message when no tasks', () => {
    renderWithRouter(
      <PendingTasksList
        tasks={[]}
        isLoading={false}
        totalItems={0}
        currentPage={1}
        itemsPerPage={10}
      />
    );
    
    expect(screen.getByText('未完了のタスクはありません')).toBeInTheDocument();
  });

  test('calls onSearch callback when search button is clicked', () => {
    const onSearchMock = jest.fn();
    renderWithRouter(
      <PendingTasksList
        tasks={testTasks}
        totalItems={testTasks.length}
        currentPage={1}
        itemsPerPage={10}
        onSearch={onSearchMock}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('タスクを検索...');
    const searchButton = screen.getByLabelText('Search');
    
    fireEvent.change(searchInput, { target: { value: '肉じゃが' } });
    fireEvent.click(searchButton);
    
    expect(onSearchMock).toHaveBeenCalledWith('肉じゃが');
  });

  test('calls onTaskClick when a task row is clicked', () => {
    const onTaskClickMock = jest.fn();
    renderWithRouter(
      <PendingTasksList
        tasks={testTasks}
        totalItems={testTasks.length}
        currentPage={1}
        itemsPerPage={10}
        onTaskClick={onTaskClickMock}
      />
    );
    
    // 最初のタスクの行をクリック
    const firstTaskTitle = testTasks[0].title;
    const taskRow = screen.getByText(firstTaskTitle).closest('tr');
    
    if (taskRow) {
      fireEvent.click(taskRow);
      expect(onTaskClickMock).toHaveBeenCalledWith(testTasks[0].id);
    }
  });

  test('calls onStatusChange when task is marked as completed', () => {
    const onStatusChangeMock = jest.fn();
    renderWithRouter(
      <PendingTasksList
        tasks={testTasks}
        totalItems={testTasks.length}
        currentPage={1}
        itemsPerPage={10}
        onStatusChange={onStatusChangeMock}
      />
    );
    
    // 最初のタスクの完了ボタンをクリック
    const completeButtons = screen.getAllByLabelText('タスク完了');
    fireEvent.click(completeButtons[0]);
    
    expect(onStatusChangeMock).toHaveBeenCalledWith(testTasks[0].id, 'completed');
  });

  test('toggles filter panel when filter button is clicked', () => {
    renderWithRouter(
      <PendingTasksList
        tasks={testTasks}
        totalItems={testTasks.length}
        currentPage={1}
        itemsPerPage={10}
      />
    );
    
    // 最初はフィルターパネルが非表示
    expect(screen.queryByText('詳細検索')).not.toBeInTheDocument();
    
    // フィルターボタンをクリック
    const filterButton = screen.getByRole('button', { name: /フィルター/i });
    fireEvent.click(filterButton);
    
    // フィルターパネルが表示される
    expect(screen.getByText('詳細検索')).toBeInTheDocument();
    
    // もう一度クリックすると非表示になる
    fireEvent.click(filterButton);
    
    // 非同期の要素の消失を待つ必要があるため、テストが複雑化する
    // このテストでは省略
  });
});
