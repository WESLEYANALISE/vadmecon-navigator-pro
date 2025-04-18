
import { ArticleCrossReference, CrossReferencesDB } from "@/types/article";

// Banco de dados simulado de referências cruzadas
// Na implementação real, isso viria de uma API ou banco de dados
const mockCrossReferencesDB: CrossReferencesDB = {
  "5": [
    {
      fromArticle: "5",
      toArticle: "7",
      type: "related",
      description: "Direitos relacionados aos citados neste artigo",
      sheetName: "Constituição Federal"
    },
    {
      fromArticle: "5",
      toArticle: "14",
      type: "complementary",
      description: "Complementa os direitos previstos neste artigo",
      sheetName: "Constituição Federal"
    }
  ],
  "6": [
    {
      fromArticle: "6",
      toArticle: "196",
      type: "related",
      description: "Direito à saúde tratado em detalhes",
      sheetName: "Constituição Federal"
    }
  ],
  "8": [
    {
      fromArticle: "8",
      toArticle: "9",
      type: "complementary",
      description: "Direitos trabalhistas complementares",
      sheetName: "Constituição Federal"
    }
  ],
  "10": [
    {
      fromArticle: "10",
      toArticle: "11",
      type: "related",
      description: "Normas relacionadas a representação coletiva",
      sheetName: "Constituição Federal"
    }
  ],
  "14": [
    {
      fromArticle: "14",
      toArticle: "5",
      type: "related",
      description: "Relacionado aos direitos fundamentais",
      sheetName: "Constituição Federal" 
    }
  ]
};

// Função para buscar referências cruzadas para um artigo específico
export async function fetchCrossReferences(articleNumber: string, sheetName?: string): Promise<ArticleCrossReference[]> {
  // Simula uma chamada assíncrona
  return new Promise((resolve) => {
    setTimeout(() => {
      // Recupera as referências do "banco de dados" mockado
      const references = mockCrossReferencesDB[articleNumber] || [];
      
      // Se um sheetName foi fornecido, filtra apenas as referências daquela planilha
      if (sheetName) {
        const filteredRefs = references.filter(ref => !ref.sheetName || ref.sheetName === sheetName);
        resolve(filteredRefs);
      } else {
        resolve(references);
      }
    }, 300); // Simula um pequeno delay de rede
  });
}

// Função para salvar uma nova referência cruzada (para uso futuro com backend real)
export async function saveCrossReference(reference: ArticleCrossReference): Promise<boolean> {
  // Simula uma chamada de API bem-sucedida
  return new Promise((resolve) => {
    setTimeout(() => {
      // Aqui você implementaria a lógica de salvamento real
      console.log("Salvando referência cruzada:", reference);
      resolve(true);
    }, 500);
  });
}
