import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

interface Transaction {
  _id?: string;
  description: string;
  amount: number;
  type: "entrada" | "saída";
  date: string | Date;
}

const BASE_URL = "http://192.168.1.8:3000";
const TRANSACTIONS_URL = `${BASE_URL}/transactions`;

export default function HomeScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"entrada" | "saída">("entrada");

  // ======================
  //  BUSCAR TRANSAÇÕES
  // ======================
  async function loadTransactions() {
    try {
      console.log("GET →", TRANSACTIONS_URL);

      const response = await fetch(TRANSACTIONS_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: Transaction[] = await response.json();
      setTransactions(data);

      const total = data.reduce((acc, item) => {
        return item.type === "entrada"
          ? acc + item.amount
          : acc - item.amount;
      }, 0);

      setBalance(total);
    } catch (err) {
      console.log("❌ Erro ao carregar transações:", err);
    }
  }

  useEffect(() => {
    // evita race condition do Expo
    const timer = setTimeout(() => {
      loadTransactions();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // ======================
  //  ADICIONAR TRANSAÇÃO
  // ======================
  async function addTransaction() {
    if (!description || !amount) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    const newTransaction = {
      description,
      amount: Number(amount),
      type,
      date: new Date(),
    };

    try {
      console.log("POST →", TRANSACTIONS_URL, newTransaction);

      const response = await fetch(TRANSACTIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const saved: Transaction = await response.json();

      setTransactions((prev) => [saved, ...prev]);
      setBalance((prev) =>
        type === "entrada" ? prev + saved.amount : prev - saved.amount
      );

      setDescription("");
      setAmount("");
      setType("entrada");
    } catch (err) {
      console.log("❌ Erro ao salvar transação:", err);
    }
  }

  return (
    <View style={styles.container}>
      {/* SALDO */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Saldo atual</Text>
        <Text style={styles.balanceValue}>
          R$ {balance.toFixed(2)}
        </Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id!}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>

            <Text
              style={[
                styles.amount,
                item.type === "entrada"
                  ? styles.income
                  : styles.expense,
              ]}
            >
              {item.type === "entrada" ? "+" : "-"} R$ {item.amount}
            </Text>
          </View>
        )}
      />

      {/* FORMULÁRIO */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Nova transação</Text>

        <TextInput
          placeholder="Descrição"
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          placeholder="Valor"
          style={styles.input}
          value={amount}
          keyboardType="numeric"
          onChangeText={setAmount}
        />

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "entrada" && styles.typeSelected,
            ]}
            onPress={() => setType("entrada")}
          >
            <Text>Entrada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "saída" && styles.typeSelected,
            ]}
            onPress={() => setType("saída")}
          >
            <Text>Saída</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={addTransaction}
        >
          <Text style={styles.submitText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ======================
//  STYLES
// ======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  balanceContainer: {
    marginBottom: 25,
  },

  balanceLabel: {
    fontSize: 16,
    color: "#555",
  },

  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
  },

  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  description: {
    fontSize: 16,
  },

  date: {
    fontSize: 12,
    color: "#888",
  },

  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },

  income: {
    color: "green",
  },

  expense: {
    color: "red",
  },

  form: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  typeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  typeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },

  typeSelected: {
    backgroundColor: "#e5e5e5",
  },

  submitButton: {
    backgroundColor: "#0085FF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
