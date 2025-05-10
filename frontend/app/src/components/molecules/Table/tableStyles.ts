/**
 * テーブルスタイルを定義するCSS変数
 */
export const tableVariables = `
  --table-border-color: #E2E8F0;
  --table-header-bg: #F7FAFC;
  --table-hover-bg: #F7FAFC;
  --table-selected-bg: #EBF8FF;
  --table-stripe-bg: #F9FAFB;
  --table-text-color: #1A202C;
  --table-header-text-color: #4A5568;
  --table-font-family: inherit;
  --table-header-font-weight: 600;
  --table-sort-icon-size: 1rem;
  --table-row-height: 3rem;
  --table-header-height: 3.5rem;
  --table-padding-x: 1rem;
  --table-border-radius: 0.5rem;
  --table-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --table-loading-overlay-bg: rgba(255, 255, 255, 0.7);
`;

/**
 * テーブル全体のスタイル
 */
export const tableStyles = `
  ${tableVariables}
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--table-font-family);
  color: var(--table-text-color);
  background-color: white;
  border: 1px solid var(--table-border-color);
  border-radius: var(--table-border-radius);
  box-shadow: var(--table-shadow);
  overflow: hidden;
`;

/**
 * テーブルヘッダーのスタイル
 */
export const tableHeaderStyles = `
  background-color: var(--table-header-bg);
  border-bottom: 1px solid var(--table-border-color);
  
  th {
    height: var(--table-header-height);
    padding: 0 var(--table-padding-x);
    text-align: left;
    font-weight: var(--table-header-font-weight);
    color: var(--table-header-text-color);
    white-space: nowrap;
    position: relative;
    transition: background-color 0.2s;
  }
  
  th.table__header-cell--sortable {
    cursor: pointer;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  th.table__header-cell--sorted-asc,
  th.table__header-cell--sorted-desc {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  th.table__header-cell--align-left {
    text-align: left;
  }
  
  th.table__header-cell--align-center {
    text-align: center;
  }
  
  th.table__header-cell--align-right {
    text-align: right;
  }
`;

/**
 * テーブル本体のスタイル
 */
export const tableBodyStyles = `
  td {
    height: var(--table-row-height);
    padding: 0 var(--table-padding-x);
    border-bottom: 1px solid var(--table-border-color);
    transition: background-color 0.2s;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr.table__row--clickable {
    cursor: pointer;
  }
  
  tr.table__row--clickable:hover {
    background-color: var(--table-hover-bg);
  }
  
  tr.table__row--selected {
    background-color: var(--table-selected-bg);
  }
  
  td.table__body-cell--align-left {
    text-align: left;
  }
  
  td.table__body-cell--align-center {
    text-align: center;
  }
  
  td.table__body-cell--align-right {
    text-align: right;
  }
  
  td.table__body-cell--checkbox {
    width: 1%;
    white-space: nowrap;
    padding-right: 0;
  }
`;

/**
 * テーブルのレスポンシブ対応スタイル
 */
export const tableResponsiveStyles = `
  .table-container {
    width: 100%;
    overflow-x: auto;
    position: relative;
  }
  
  .table-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--table-loading-overlay-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  
  .table-empty-message {
    padding: 2rem 1rem;
    text-align: center;
    color: #718096;
  }
  
  .table-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .table-pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 1rem;
    border-top: 1px solid var(--table-border-color);
  }
  
  @media (max-width: 768px) {
    .table {
      display: none;
    }
    
    .table-cards {
      display: block;
    }
  }
  
  @media (min-width: 769px) {
    .table {
      display: table;
    }
    
    .table-cards {
      display: none;
    }
  }
`;

/**
 * カードビュー（モバイル表示用）のスタイル
 */
export const tableCardsStyles = `
  .table-card {
    border: 1px solid var(--table-border-color);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: white;
    box-shadow: var(--table-shadow);
    
    &--selected {
      background-color: var(--table-selected-bg);
    }
    
    &--clickable {
      cursor: pointer;
      
      &:hover {
        background-color: var(--table-hover-bg);
      }
    }
    
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--table-border-color);
    }
    
    &__field {
      display: flex;
      margin-bottom: 0.5rem;
      
      &-label {
        font-weight: var(--table-header-font-weight);
        width: 40%;
        color: var(--table-header-text-color);
      }
      
      &-value {
        width: 60%;
      }
    }
  }
`;
