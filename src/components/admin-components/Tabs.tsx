import { Pressable, Text, View } from 'react-native';

export interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

// Tabs de navegación para secciones del admin
export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <View className="flex-row bg-white border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 py-3.5 items-center justify-center border-b-2 ${isActive ? 'border-primary bg-white/50' : 'border-transparent'}`}
          >
            <Text
              className={`text-sm font-medium ${isActive ? 'text-primary font-bold' : 'text-text/60'}`}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}