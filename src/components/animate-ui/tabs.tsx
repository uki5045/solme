'use client';

import * as React from 'react';
import { motion, HTMLMotionProps, Transition } from 'motion/react';
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

// TabsList - container for triggers with sliding indicator
interface TabsListProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  indicatorClassName?: string;
}

function TabsList({ children, className, indicatorClassName, ...props }: TabsListProps) {
  const { activeValue } = useTabs();
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!listRef.current) return;

    const activeButton = listRef.current.querySelector(
      `[data-value="${activeValue}"]`
    ) as HTMLElement;

    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeValue]);

  return (
    <div
      ref={listRef}
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        'relative inline-flex items-center rounded-xl bg-gray-100 p-1',
        className
      )}
      {...props}
    >
      {/* Sliding indicator */}
      <motion.div
        className={cn('absolute top-1 bottom-1 rounded-lg bg-white shadow-sm', indicatorClassName)}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
          mass: 1,
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
        'relative z-10 inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// TabsContents - container for tab contents with slide animation
interface TabsContentsProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  transition?: Transition;
}

function TabsContents({
  children,
  className,
  transition = {
    type: 'spring',
    stiffness: 150,
    damping: 20,
    mass: 1,
  },
  ...props
}: TabsContentsProps) {
  const { activeValue } = useTabs();
  const childrenArray = React.Children.toArray(children);

  const activeIndex = childrenArray.findIndex(
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
      className={cn('overflow-hidden', className)}
      {...props}
    >
      <motion.div
        className="flex"
        animate={{ x: `${activeIndex * -100}%` }}
        transition={transition}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// TabsContent - individual tab content with blur effect
interface TabsContentProps extends HTMLMotionProps<'div'> {
  value: string;
  children: React.ReactNode;
}

function TabsContent({
  children,
  value,
  className,
  ...props
}: TabsContentProps) {
  const { activeValue } = useTabs();
  const isActive = activeValue === value;

  return (
    <motion.div
      role="tabpanel"
      data-slot="tabs-content"
      data-value={value}
      className={cn('w-full', className)}
      initial={{ opacity: 1 }}
      animate={{
        opacity: isActive ? 1 : 0,
      }}
      transition={{
        duration: 0.15,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContents, TabsContent, useTabs };
