/**
 * スケジュールカレンダーコンポーネント
 * ヘルパーのスケジュールをカレンダー形式で表示
 */
import { FC, useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack,
  Grid, 
  GridItem, 
  Text, 
  Badge, 
  Button, 
  IconButton, 
  useColorModeValue, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
  Divider,
  Skeleton,
  Tooltip
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarDaysIcon, 
  ChevronDownIcon, 
  ViewColumnsIcon,
  TableCellsIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { format, parseISO, isToday, isSameMonth, addDays, getDay, startOfWeek, startOfMonth, endOfMonth, getDate, addMonths, subMonths, setDate } from 'date-fns';
import { ja } from 'date-fns/locale';

import { CalendarEvent } from '../../types/calendar';
import { CalendarViewType } from '../../services/calendarService';

// 曜日の配列（日本語）
const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

export interface ScheduleCalendarProps {
  /**
   * カレンダーに表示するイベント
   */
  events: CalendarEvent[];
  /**
   * データ読込中フラグ
   */
  isLoading?: boolean;
  /**
   * 初期表示のビュータイプ
   */
  initialView?: CalendarViewType;
  /**
   * 初期表示の日付
   */
  initialDate?: Date;
  /**
   * 日付変更時のコールバック
   */
  onDateChange?: (date: Date) => void;
  /**
   * ビュータイプ変更時のコールバック
   */
  onViewChange?: (viewType: CalendarViewType) => void;
  /**
   * イベントクリック時のコールバック
   */
  onEventClick?: (event: CalendarEvent) => void;
  /**
   * カレンダーの日付セルクリック時のコールバック
   */
  onDateClick?: (date: Date) => void;
  /**
   * 新規イベント追加時のコールバック
   */
  onAddEvent?: (date: Date) => void;
}

/**
 * スケジュールカレンダーコンポーネント
 * 日、週、月のビューを切り替え可能なカレンダー
 */
export const ScheduleCalendar: FC<ScheduleCalendarProps> = ({
  events,
  isLoading = false,
  initialView = 'week',
  initialDate = new Date(),
  onDateChange,
  onViewChange,
  onEventClick,
  onDateClick,
  onAddEvent,
}) => {
  // 現在の表示日と表示タイプの状態
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewType, setViewType] = useState<CalendarViewType>(initialView);
  
  // 色関連
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  const todayColor = useColorModeValue('blue.600', 'blue.200');
  const otherMonthColor = useColorModeValue('gray.400', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  
  // 日付が変更された時にコールバックを呼び出す
  useEffect(() => {
    onDateChange?.(currentDate);
  }, [currentDate, onDateChange]);
  
  // ビュータイプが変更された時にコールバックを呼び出す
  useEffect(() => {
    onViewChange?.(viewType);
  }, [viewType, onViewChange]);
  
  // 前の期間へ移動
  const goToPrevious = () => {
    if (viewType === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else if (viewType === 'week') {
      setCurrentDate(prev => addDays(prev, -7));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };
  
  // 次の期間へ移動
  const goToNext = () => {
    if (viewType === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (viewType === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };
  
  // 今日へ移動
  const goToday = () => {
    setCurrentDate(new Date());
  };
  
  // ビュータイプ変更ハンドラ
  const handleViewChange = (newView: CalendarViewType) => {
    setViewType(newView);
  };
  
  // カレンダーのタイトル
  const calendarTitle = useMemo(() => {
    if (viewType === 'day') {
      return format(currentDate, 'yyyy年M月d日(E)', { locale: ja });
    } else if (viewType === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 月曜始まり
      const weekEnd = addDays(weekStart, 6);
      if (format(weekStart, 'M') === format(weekEnd, 'M')) {
        return `${format(weekStart, 'yyyy年M月')} ${format(weekStart, 'd')}〜${format(weekEnd, 'd')}日`;
      } else {
        return `${format(weekStart, 'yyyy年M月d日')}〜${format(weekEnd, 'M月d日')}`;
      }
    } else {
      return format(currentDate, 'yyyy年M月', { locale: ja });
    }
  }, [currentDate, viewType]);
  
  // 日付セルクリックハンドラ
  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };
  
  // イベントクリックハンドラ
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // セルのクリックイベントが発火しないようにする
    onEventClick?.(event);
  };
  
  // 新規イベント追加ハンドラ
  const handleAddEvent = (date: Date) => {
    onAddEvent?.(date);
  };
  
  // 日表示のレンダリング
  const renderDayView = () => {
    // 時間帯の配列（8時〜20時）
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);
    
    // 現在日付の時間帯のイベントをフィルタリング
    const dayEvents = events.filter(event => {
      const eventDate = parseISO(event.start);
      return format(eventDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
    });
    
    return (
      <Box>
        <Grid
          templateColumns="80px 1fr"
          borderTop="1px"
          borderLeft="1px"
          borderColor={borderColor}
        >
          {hours.map(hour => {
            // この時間に開始するイベントを抽出
            const hourEvents = dayEvents.filter(event => {
              const eventHour = parseISO(event.start).getHours();
              return eventHour === hour;
            });
            
            return (
              <React.Fragment key={hour}>
                {/* 時間表示 */}
                <GridItem 
                  py={2} 
                  px={2} 
                  borderBottom="1px" 
                  borderRight="1px" 
                  borderColor={borderColor}
                  bg={headerBg}
                >
                  <Text fontSize="sm" textAlign="center">
                    {`${hour}:00`}
                  </Text>
                </GridItem>
                
                {/* イベントセル */}
                <GridItem 
                  py={2} 
                  px={2} 
                  borderBottom="1px" 
                  borderRight="1px" 
                  borderColor={borderColor}
                  minH="80px"
                  position="relative"
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  onClick={() => handleDateClick(new Date(currentDate.setHours(hour, 0, 0, 0)))}
                >
                  {isLoading ? (
                    <Skeleton height="70px" width="100%" />
                  ) : (
                    <VStack align="stretch" spacing={1}>
                      {hourEvents.map(event => (
                        <Box
                          key={event.id}
                          p={2}
                          borderRadius="md"
                          bg={event.color || 'blue.100'}
                          color={event.color ? 'white' : 'black'}
                          fontSize="sm"
                          cursor="pointer"
                          _hover={{ opacity: 0.8 }}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <Text fontWeight="medium" noOfLines={1}>
                            {event.title}
                          </Text>
                          <HStack fontSize="xs" spacing={1}>
                            <Text>
                              {format(parseISO(event.start), 'HH:mm')}〜{format(parseISO(event.end), 'HH:mm')}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </GridItem>
              </React.Fragment>
            );
          })}
        </Grid>
      </Box>
    );
  };
  
  // 週表示のレンダリング
  const renderWeekView = () => {
    // 週の開始日（月曜日）
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    // 週の各日の配列
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    // 時間帯の配列（8時〜20時）
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);
    
    return (
      <Box>
        <Grid
          templateColumns="80px repeat(7, 1fr)"
          borderTop="1px"
          borderLeft="1px"
          borderColor={borderColor}
        >
          {/* 曜日ヘッダー */}
          <GridItem 
            py={2} 
            px={2} 
            borderBottom="1px" 
            borderRight="1px" 
            borderColor={borderColor}
            bg={headerBg}
          >
            <Text fontSize="sm" textAlign="center">時間</Text>
          </GridItem>
          
          {days.map((day, dayIndex) => (
            <GridItem 
              key={dayIndex} 
              py={2} 
              px={2} 
              borderBottom="1px" 
              borderRight="1px" 
              borderColor={borderColor}
              bg={isToday(day) ? todayBg : headerBg}
            >
              <VStack spacing={0} align="center">
                <Text 
                  fontSize="sm" 
                  fontWeight={isToday(day) ? "bold" : "normal"}
                  color={isToday(day) ? todayColor : undefined}
                >
                  {weekDays[getDay(day)]}
                </Text>
                <Text 
                  fontSize="md" 
                  fontWeight={isToday(day) ? "bold" : "normal"}
                  color={isToday(day) ? todayColor : undefined}
                >
                  {getDate(day)}
                </Text>
              </VStack>
            </GridItem>
          ))}
          
          {/* 時間ごとの行 */}
          {hours.map(hour => (
            <React.Fragment key={hour}>
              {/* 時間表示 */}
              <GridItem 
                py={2} 
                px={2} 
                borderBottom="1px" 
                borderRight="1px" 
                borderColor={borderColor}
                bg={headerBg}
              >
                <Text fontSize="sm" textAlign="center">
                  {`${hour}:00`}
                </Text>
              </GridItem>
              
              {/* 各曜日のセル */}
              {days.map((day, dayIndex) => {
                const cellDate = new Date(day);
                cellDate.setHours(hour, 0, 0, 0);
                
                // この日時に開始するイベントを抽出
                const cellEvents = events.filter(event => {
                  const eventStart = parseISO(event.start);
                  return (
                    format(eventStart, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
                    eventStart.getHours() === hour
                  );
                });
                
                return (
                  <GridItem 
                    key={dayIndex} 
                    py={1} 
                    px={1} 
                    borderBottom="1px" 
                    borderRight="1px" 
                    borderColor={borderColor}
                    minH="50px"
                    _hover={{ bg: hoverBg }}
                    cursor="pointer"
                    onClick={() => handleDateClick(cellDate)}
                  >
                    {isLoading ? (
                      <Skeleton height="40px" width="100%" />
                    ) : (
                      <VStack align="stretch" spacing={1}>
                        {cellEvents.map(event => (
                          <Box
                            key={event.id}
                            p={1}
                            borderRadius="sm"
                            bg={event.color || 'blue.100'}
                            color={event.color ? 'white' : 'black'}
                            fontSize="xs"
                            cursor="pointer"
                            _hover={{ opacity: 0.8 }}
                            onClick={(e) => handleEventClick(event, e)}
                            noOfLines={2}
                          >
                            {event.title}
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </GridItem>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // 月表示のレンダリング
  const renderMonthView = () => {
    // 月の開始日
    const monthStart = startOfMonth(currentDate);
    
    // 月の最終日
    const monthEnd = endOfMonth(currentDate);
    
    // カレンダーの開始日（月の開始日がある週の月曜日）
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    
    // 表示する週の数（通常6週間分）
    const weeks = 6;
    
    // カレンダーのセル数（6週 × 7日）
    const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(calendarStart, i));
    
    return (
      <Box>
        <Grid
          templateColumns="repeat(7, 1fr)"
          borderTop="1px"
          borderLeft="1px"
          borderColor={borderColor}
        >
          {/* 曜日ヘッダー */}
          {weekDays.map((day, index) => (
            <GridItem 
              key={index} 
              py={2} 
              px={2} 
              borderBottom="1px" 
              borderRight="1px" 
              borderColor={borderColor}
              bg={headerBg}
              color={index === 0 ? 'red.500' : index === 6 ? 'blue.500' : undefined}
            >
              <Text fontWeight="medium" textAlign="center">{day}</Text>
            </GridItem>
          ))}
          
          {/* 日付のセル */}
          {days.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isCurrentDay = isToday(date);
            
            // この日に関連するイベント
            const dateEvents = events.filter(event => {
              const eventDate = parseISO(event.start);
              return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            });
            
            // 表示する最大イベント数
            const maxEvents = 3;
            const hasMoreEvents = dateEvents.length > maxEvents;
            
            return (
              <GridItem 
                key={index} 
                py={1} 
                px={2} 
                borderBottom="1px" 
                borderRight="1px" 
                borderColor={borderColor}
                bg={isCurrentDay ? todayBg : undefined}
                opacity={isCurrentMonth ? 1 : 0.5}
                minH="100px"
                position="relative"
                _hover={{ bg: hoverBg }}
                cursor="pointer"
                onClick={() => handleDateClick(date)}
              >
                <Flex justify="space-between" align="center" mb={1}>
                  <Text 
                    fontSize="sm" 
                    fontWeight={isCurrentDay ? "bold" : "normal"}
                    color={
                      !isCurrentMonth ? otherMonthColor : 
                      isCurrentDay ? todayColor : 
                      getDay(date) === 0 ? 'red.500' : 
                      getDay(date) === 6 ? 'blue.500' : undefined
                    }
                  >
                    {getDate(date)}
                  </Text>
                  
                  <Tooltip label="予定を追加">
                    <IconButton
                      aria-label="Add event"
                      icon={<Box as={PlusIcon} w={3} h={3} />}
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEvent(date);
                      }}
                    />
                  </Tooltip>
                </Flex>
                
                {isLoading ? (
                  <VStack spacing={1} align="stretch">
                    <Skeleton height="18px" width="100%" />
                    <Skeleton height="18px" width="100%" />
                  </VStack>
                ) : (
                  <VStack spacing={1} align="stretch">
                    {dateEvents.slice(0, maxEvents).map(event => (
                      <Box
                        key={event.id}
                        p={1}
                        borderRadius="sm"
                        bg={event.color || 'blue.100'}
                        color={event.color ? 'white' : 'black'}
                        fontSize="xs"
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                        onClick={(e) => handleEventClick(event, e)}
                        noOfLines={1}
                      >
                        {event.title}
                      </Box>
                    ))}
                    
                    {hasMoreEvents && (
                      <Text fontSize="xs" fontWeight="medium" color="gray.500">
                        他 {dateEvents.length - maxEvents} 件
                      </Text>
                    )}
                  </VStack>
                )}
              </GridItem>
            );
          })}
        </Grid>
      </Box>
    );
  };
  
  return (
    <Box>
      {/* カレンダーヘッダー */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={4}
        flexDir={{ base: 'column', md: 'row' }}
        gap={{ base: 2, md: 0 }}
      >
        <HStack>
          <IconButton
            aria-label="Previous"
            icon={<Box as={ChevronLeftIcon} w={5} h={5} />}
            onClick={goToPrevious}
          />
          
          <Button
            onClick={goToday}
            size={{ base: 'sm', md: 'md' }}
          >
            今日
          </Button>
          
          <IconButton
            aria-label="Next"
            icon={<Box as={ChevronRightIcon} w={5} h={5} />}
            onClick={goToNext}
          />
          
          <Text 
            fontWeight="bold" 
            fontSize={{ base: 'md', md: 'xl' }}
            px={2}
          >
            {calendarTitle}
          </Text>
        </HStack>
        
        <HStack>
          <Box>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<Box as={ChevronDownIcon} w={4} h={4} />}
                leftIcon={<Box as={CalendarDaysIcon} w={4} h={4} />}
                size={{ base: 'sm', md: 'md' }}
              >
                {viewType === 'day' ? '日表示' : viewType === 'week' ? '週表示' : '月表示'}
              </MenuButton>
              <MenuList>
                <MenuItem 
                  icon={<Box as={TableCellsIcon} w={4} h={4} />} 
                  onClick={() => handleViewChange('day')}
                >
                  日表示
                </MenuItem>
                <MenuItem 
                  icon={<Box as={ViewColumnsIcon} w={4} h={4} />}
                  onClick={() => handleViewChange('week')}
                >
                  週表示
                </MenuItem>
                <MenuItem 
                  icon={<Box as={CalendarDaysIcon} w={4} h={4} />}
                  onClick={() => handleViewChange('month')}
                >
                  月表示
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </HStack>
      </Flex>
      
      {/* カレンダー本体 */}
      <Box 
        overflowX="auto" 
        overflowY="auto" 
        maxH={{ base: 'calc(100vh - 240px)', md: 'calc(100vh - 200px)' }}
        pb={4}
      >
        {viewType === 'day' && renderDayView()}
        {viewType === 'week' && renderWeekView()}
        {viewType === 'month' && renderMonthView()}
      </Box>
      
      {isLoading && (
        <Text textAlign="center" mt={2} fontSize="sm" color="gray.500">
          スケジュールを読み込み中...
        </Text>
      )}
    </Box>
  );
};

export default ScheduleCalendar;
