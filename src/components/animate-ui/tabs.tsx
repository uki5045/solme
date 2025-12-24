'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Context for Tabs state
interface TabsContextValue {
  activeValue: string;
  setActiveValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// Root Tabs component
interface TabsProps extends React.ComponentProps<'div'> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Tabs({
  defaultValue = '',
  value,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const activeValue = value ?? internalValue;

  const setActiveValue = React.useCallback((newValue: string) => {
    if (!value) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div
        data-slot="tabs"
        className={cn('flex flex-col', className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabsList - container for triggers (NO animation)
interface TabsListProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  indicatorClassName?: string;
}

function TabsList({ children, className, indicatorClassName, ...props }: TabsListProps) {
  const { activeValue } = useTabs();
  const [indicatorStyle, setIndicatorStyle] = React.useState({ x: 0, width: 0 });
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateIndicator = () => {
      if (!listRef.current) return;

      const activeButton = listRef.current.querySelector(
        `[data-value="${activeValue}"]`
      ) as HTMLElement;

      if (activeButton) {
        setIndicatorStyle({
          x: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        });
      }
    };

    updateIndicator();

    // 리사이즈 시 인디케이터 위치 재계산
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeValue]);

  return (
    <div
      ref={listRef}
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        'relative inline-flex items-center rounded-xl border border-gray-200/60 bg-gray-100/80 p-1 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50',
        className
      )}
      {...props}
    >
      {/* Indicator - NO animation */}
      <div
        className={cn(
          'absolute top-1 bottom-1 rounded-lg bg-white shadow-md dark:bg-gray-700',
          indicatorClassName
        )}
        style={{
          left: indicatorStyle.x,
          width: indicatorStyle.width,
        }}
      />
      {children}
    </div>
  );
}

// TabsTrigger - individual tab button
interface TabsTriggerProps extends React.ComponentProps<'button'> {
  value: string;
  children: React.ReactNode;
}

function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps) {
  const { activeValue, setActiveValue } = useTabs();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      data-slot="tabs-trigger"
      data-value={value}
      data-state={isActive ? 'active' : 'inactive'}
      aria-selected={isActive}
      onClick={() => setActiveValue(value)}
      className={cn(
        'relative z-10 inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// TabsContents - container (renders only active tab)
interface TabsContentsProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function TabsContents({
  children,
  className,
  ...props
}: TabsContentsProps) {
  const { activeValue } = useTabs();
  const childrenArray = React.Children.toArray(children);

  // 활성 탭만 찾아서 렌더링
  const activeChild = childrenArray.find(
    (child): child is React.ReactElement<{ value: string }> =>
      React.isValidElement(child) &&
      typeof child.props === 'object' &&
      child.props !== null &&
      'value' in child.props &&
      child.props.value === activeValue
  );

  return (
    <div
      data-slot="tabs-contents"
      className={cn('', className)}
      {...props}
    >
      {activeChild}
    </div>
  );
}

// TabsContent - individual tab content (NO animation)
interface TabsContentProps extends React.ComponentProps<'div'> {
  value: string;
  children: React.ReactNode;
}

function TabsContent({
  children,
  value,
  className,
  ...props
}: TabsContentProps) {
  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      data-value={value}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContents, TabsContent, useTabs };
