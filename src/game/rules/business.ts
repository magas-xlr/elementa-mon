import { next, type RngState } from './rng';

/**
 * Dynamic Business & Job Creation Economy (🏪 Minha Lojinha):
 * - Hire human employees & pay daily salaries.
 * - Mistreating employees causes them to complain about you to other NPCs (hurting your relationships!).
 * - Fire human employees & replace them with cheaper Robots (no salary, never gossip),
 *   BUT robots are less efficient and make mistakes (~35% chance to sell the WRONG product!).
 * - Customers who get angry from wrong products NEVER return to your shop!
 */

export interface ShopEmployee {
  id: string;
  name: string;
  kind: 'humano' | 'robo';
  dailySalary: number;
  /** 0..100 morale (humans only; if < 35 they gossip against you!). */
  morale: number;
  /** Error rate per sale (humans ~5%, robots ~35%!). */
  errorRate: number;
}

export const HIREABLE_HUMANS: readonly { id: string; name: string; salary: number }[] = [
  { id: 'emp_carla', name: 'Carla', salary: 18 },
  { id: 'emp_diego', name: 'Diego', salary: 20 },
  { id: 'emp_sofia', name: 'Sofia', salary: 22 },
];

export const ROBOT_BUY_PRICE = 55;
export const CUSTOMER_POOL = [
  'Sr. Marcos',
  'Dona Vera',
  'Joãozinho',
  'Beatriz',
  'Tio Paulo',
  'Camila',
] as const;

export interface BusinessState {
  employees: ShopEmployee[];
  /** Customers who got angry (e.g., robot sold wrong product) and will NEVER return! */
  bannedCustomers: string[];
  gossipPenaltyCount: number;
}

export function createBusinessState(): BusinessState {
  return {
    employees: [],
    bannedCustomers: [],
    gossipPenaltyCount: 0,
  };
}

export function hireHumanEmployee(
  state: BusinessState,
  empId: string
): { ok: boolean; msg: string } {
  const tpl = HIREABLE_HUMANS.find((h) => h.id === empId);
  if (!tpl) return { ok: false, msg: 'Candidato inválido.' };
  if (state.employees.some((e) => e.id === tpl.id))
    return { ok: false, msg: `${tpl.name} já trabalha na sua loja.` };
  state.employees.push({
    id: tpl.id,
    name: tpl.name,
    kind: 'humano',
    dailySalary: tpl.salary,
    morale: 75,
    errorRate: 0.05,
  });
  return {
    ok: true,
    msg: `👔 Contratou ${tpl.name} (salário ${tpl.salary}/dia · 95% de precisão)!`,
  };
}

export function fireEmployee(state: BusinessState, empId: string): { ok: boolean; msg: string } {
  const idx = state.employees.findIndex((e) => e.id === empId);
  if (idx < 0) return { ok: false, msg: 'Funcionário não encontrado.' };
  const [removed] = state.employees.splice(idx, 1);
  return { ok: true, msg: `📋 Demitiu ${removed.name} da sua loja.` };
}

export function installShopRobot(
  state: BusinessState,
  wallet: number
): { ok: boolean; cost: number; msg: string } {
  if (wallet < ROBOT_BUY_PRICE) {
    return {
      ok: false,
      cost: 0,
      msg: `Saldo insuficiente (${ROBOT_BUY_PRICE}) para comprar um Robô Atendente.`,
    };
  }
  const num = state.employees.filter((e) => e.kind === 'robo').length + 1;
  state.employees.push({
    id: `robo_${num}_${Date.now()}`,
    name: `Robô-Caixa #${num}`,
    kind: 'robo',
    dailySalary: 0,
    morale: 100,
    errorRate: 0.35,
  });
  return {
    ok: true,
    cost: ROBOT_BUY_PRICE,
    msg: `🤖 Instalou Robô-Caixa #${num}! Sem salário e nunca fala mal de você, mas tem 35% de chance de errar o pedido!`,
  };
}

/** Treat a human employee well (+morale) or badly (-morale -> gossips to other NPCs!). */
export function treatEmployee(
  state: BusinessState,
  empId: string,
  kind: 'elogiar' | 'maltratar'
): { ok: boolean; gossipTriggered: boolean; msg: string } {
  const emp = state.employees.find((e) => e.id === empId);
  if (!emp) return { ok: false, gossipTriggered: false, msg: 'Funcionário não encontrado.' };
  if (emp.kind === 'robo') {
    return {
      ok: true,
      gossipTriggered: false,
      msg: `🤖 ${emp.name} não tem sentimentos e nunca fala mal de você.`,
    };
  }
  if (kind === 'elogiar') {
    emp.morale = Math.min(100, emp.morale + 20);
    return {
      ok: true,
      gossipTriggered: false,
      msg: `😊 ${emp.name} ficou motivado(a)! (Moral: ${emp.morale}%)`,
    };
  }
  emp.morale = Math.max(0, emp.morale - 35);
  const gossip = emp.morale < 45;
  if (gossip) state.gossipPenaltyCount += 1;
  return {
    ok: true,
    gossipTriggered: gossip,
    msg: gossip
      ? `😠 Você tratou ${emp.name} mal (Moral ${emp.morale}%)! Ele(a) reclamou de você para os NPCs do bairro (−vínculo)!`
      : `😕 ${emp.name} ficou chateado(a) com o tratamento (Moral: ${emp.morale}%).`,
  };
}

/** Simulates a daily shift at your shop: pays salaries, processes customer orders, robot mistakes & permanent angry customers! */
export function runShopShift(
  state: BusinessState,
  rng: RngState
): { revenue: number; salaryCost: number; angryCustomer?: string; msg: string } {
  const activeCustomers = CUSTOMER_POOL.filter((c) => !state.bannedCustomers.includes(c));
  if (!state.employees.length) {
    return {
      revenue: 0,
      salaryCost: 0,
      msg: 'Contrate funcionários ou robôs para automatizar vendas na sua loja!',
    };
  }
  if (!activeCustomers.length) {
    return {
      revenue: 0,
      salaryCost: state.employees.reduce((s, e) => s + e.dailySalary, 0),
      msg: '😤 Todos os clientes do bairro ficaram mal-humorados e nunca mais voltaram para sua loja!',
    };
  }

  let revenue = 0;
  let salaryCost = 0;
  let angryCustomer: string | undefined;

  for (const emp of state.employees) {
    salaryCost += emp.dailySalary;
    const customer = activeCustomers[Math.floor(next(rng) * activeCustomers.length)];
    const madeError = next(rng) < emp.errorRate;
    if (madeError) {
      if (!state.bannedCustomers.includes(customer)) {
        state.bannedCustomers.push(customer);
        angryCustomer = customer;
      }
    } else {
      revenue += emp.kind === 'humano' ? 34 : 22;
    }
  }

  const msg = angryCustomer
    ? `🤖⚠️ Um atendente vendeu o produto ERRADO para ${angryCustomer}, que ficou furioso(a) e NUNCA MAIS vai voltar! (+${revenue} vendas · −${salaryCost} salários)`
    : `🏪 Expediente concluído! Faturamento: +${revenue} · Salários: −${salaryCost}.`;
  return { revenue, salaryCost, angryCustomer, msg };
}
