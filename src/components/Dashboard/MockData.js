// src/components/Dashboard/mockData.js

export const MOCK_TRANSACTIONS = [
    { id: '1', date: '2023-10-02', amount: 250, type: 'expense', category: 'Comida', description: 'Compra en el supermercado' },
    { id: '2', date: '2023-10-05', amount: 5000, type: 'income', category: 'Salario', description: 'Pago de nómina mensual' },
    { id: '3', date: '2023-10-08', amount: 120, type: 'expense', category: 'Transporte', description: 'Uber a la universidad' },
    { id: '4', date: '2023-10-10', amount: 400, type: 'expense', category: 'Entretenimiento', description: 'Boletos de cine' },
    { id: '5', date: '2023-10-12', amount: 90, type: 'expense', category: 'Servicios', description: 'Suscripción de Spotify' },
    { id: '6', date: '2023-10-14', amount: 350, type: 'expense', category: 'Comida', description: 'Cena con amigos' },
];

export const MOCK_CHART_DATA = [
    { day: 'Lun', real: 420, predicted: 450 },
    { day: 'Mar', real: 300, predicted: 320 },
    { day: 'Mié', real: 550, predicted: 480 },
    { day: 'Jue', real: 450, predicted: 500 },
    { day: 'Vie', real: 700, predicted: 650 },
    { day: 'Sáb', real: 800, predicted: 750 },
    { day: 'Dom', real: 350, predicted: 400 },
];

export const MOCK_RECENT_TRANSACTIONS = [
    { id: 1, title: 'Nómina Mensual', category: 'Salario', date: '10/1/2026', amount: 1200, type: 'income' },
    { id: 2, title: 'Spotify Premium', category: 'Suscripciones', date: '09/1/2026', amount: -129, type: 'expense' },
    { id: 3, title: 'Cafetería Facultad', category: 'Alimentos', date: '08/1/2026', amount: -65.50, type: 'expense' },
];

export const MOCK_EDUCATIONAL_TIPS = [
    {
        title: "La Regla 50/30/20",
        description: "Una fórmula simple para presupuestar: 50% para necesidades básicas, 30% para deseos y estilo de vida, y 20% para ahorro e inversión.",
        iconName: "Calculator",
    },
    {
        title: "Interés Compuesto",
        description: "Es el interés sobre el interés. Empezar a invertir joven, aunque sea poco, permite que tu dinero crezca exponencialmente con el tiempo.",
        iconName: "TrendingUp",
    },
    {
        title: "Gastos Hormiga",
        description: "Esos pequeños gastos diarios (café, snacks, propinas) que parecen insignificantes pero pueden sumar miles al año. ¡Identifícalos!",
        iconName: "AlertTriangle",
    },
    {
        title: "Método Bola de Nieve",
        description: "Para pagar deudas: ordena tus deudas de menor a mayor saldo. Paga el mínimo de todas excepto la más pequeña, atácala con todo.",
        iconName: "Target",
    }
];

export const MOCK_USER_PROFILE = {
    firstName: 'Daniel',
    lastName: 'MG',
    email: 'daniel.mg@ejemplo.com',
    phone: '+52 55 1234 5678',
    occupation: 'Estudiante',
    currency: 'MXN',
    notifications: true,
    marketing: false
};