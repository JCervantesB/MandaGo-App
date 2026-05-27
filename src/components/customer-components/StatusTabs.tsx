import { Pressable, ScrollView, Text, View } from 'react-native';

type StatusTab = 'todos' | 'activo' | 'completado' | 'cancelado';

const TABS: { key: StatusTab; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Activos' },
  { key: 'completado', label: 'Completados' },
  { key: 'cancelado', label: 'Cancelados' },
];

interface StatusTabsProps {
  activeTab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
}

// Pestañas para filtrar envíos por estado
export function StatusTabs({ activeTab, onTabChange }: StatusTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 8 }}
    >
      <View className="flex-row gap-2">
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-full border ${
              activeTab === tab.key ? 'bg-primary border-primary' : 'bg-background border-border'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === tab.key ? 'text-white' : 'text-text'}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}