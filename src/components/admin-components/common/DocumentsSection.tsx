/**
 * Componente DocumentsSection
 * Muestra la lista de documentos con previsualización integrada
 */
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface DocumentItem {
  label: string;
  url: string | null;
}

interface DocumentsSectionProps {
  documents: DocumentItem[];
  onDocumentPress: (url: string, title: string) => void;
}

// Lista de documentos con previsualización integrada
export function DocumentsSection({ documents, onDocumentPress }: DocumentsSectionProps) {
  return (
    <View className="mb-5">
      <Text className="text-lg font-bold text-text mb-3">Documentos</Text>
      <View className="bg-white rounded-xl p-4">
        {documents.map((doc, index) => (
          <View key={doc.label}>
            {index > 0 && <View className="h-px bg-border my-1" />}
            <TouchableOpacity
              className="flex-row justify-between items-center py-2"
              onPress={() => doc.url && onDocumentPress(doc.url, doc.label)}
              disabled={!doc.url}
            >
              <Text className="text-sm text-text/60">{doc.label}</Text>
              <View className="flex-row items-center gap-2">
                {doc.url ? (
                  <>
                    <Text className="text-sm text-primary font-medium">Ver documento</Text>
                    <Image source={{ uri: doc.url }} className="w-10 h-10 rounded bg-border" />
                  </>
                ) : (
                  <Text className="text-sm text-text/50">No adjuntada</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}