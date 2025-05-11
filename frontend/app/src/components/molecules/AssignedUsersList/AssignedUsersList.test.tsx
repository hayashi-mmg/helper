import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AssignedUsersList } from './AssignedUsersList';
import { mockUsers } from '../../../mocks/users';

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AssignedUsersList', () => {
  test('renders user list correctly', () => {
    renderWithRouter(
      <AssignedUsersList
        users={mockUsers}
        totalItems={mockUsers.length}
        currentPage={1}
        itemsPerPage={10}
      />
    );
    
    // 各ユーザーの名前が表示されていることを確認
    mockUsers.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
    });
    
    // テーブルのヘッダーが存在することを確認
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('住所')).toBeInTheDocument();
    expect(screen.getByText('連絡先')).toBeInTheDocument();
    expect(screen.getByText('未処理')).toBeInTheDocument();
  });

  test('shows loading spinner when isLoading is true', () => {
    renderWithRouter(
      <AssignedUsersList
        users={[]}
        isLoading={true}
        totalItems={0}
        currentPage={1}
        itemsPerPage={10}
      />
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinnerはrole="status"を持つ
  });

  test('shows empty message when no users', () => {
    renderWithRouter(
      <AssignedUsersList
        users={[]}
        isLoading={false}
        totalItems={0}
        currentPage={1}
        itemsPerPage={10}
      />
    );
    
    expect(screen.getByText('担当ユーザーがいません')).toBeInTheDocument();
  });

  test('calls onSearch callback when search button is clicked', () => {
    const onSearchMock = jest.fn();
    renderWithRouter(
      <AssignedUsersList
        users={mockUsers}
        totalItems={mockUsers.length}
        currentPage={1}
        itemsPerPage={10}
        onSearch={onSearchMock}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('ユーザーを検索...');
    const searchButton = screen.getByLabelText('Search');
    
    fireEvent.change(searchInput, { target: { value: '田中' } });
    fireEvent.click(searchButton);
    
    expect(onSearchMock).toHaveBeenCalledWith('田中');
  });

  test('calls onPageChange when pagination buttons are clicked', () => {
    const onPageChangeMock = jest.fn();
    renderWithRouter(
      <AssignedUsersList
        users={mockUsers}
        totalItems={20} // 2ページ分のデータがあると仮定
        currentPage={1}
        itemsPerPage={10}
        onPageChange={onPageChangeMock}
      />
    );
    
    const nextPageButton = screen.getByLabelText('Next page');
    fireEvent.click(nextPageButton);
    
    expect(onPageChangeMock).toHaveBeenCalledWith(2);
  });

  test('calls onUserClick when a user row is clicked', () => {
    const onUserClickMock = jest.fn();
    renderWithRouter(
      <AssignedUsersList
        users={mockUsers}
        totalItems={mockUsers.length}
        currentPage={1}
        itemsPerPage={10}
        onUserClick={onUserClickMock}
      />
    );
    
    // 最初のユーザーの行をクリック
    const firstUserName = mockUsers[0].name;
    const userRow = screen.getByText(firstUserName).closest('tr');
    
    if (userRow) {
      fireEvent.click(userRow);
      expect(onUserClickMock).toHaveBeenCalledWith(mockUsers[0].id);
    }
  });
});
