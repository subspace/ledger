/// <reference types="node" />
import { IPledge, IContract } from './interfaces';
import { Record, IValue } from '@subspace/database';
import { EventEmitter } from 'events';
export declare class Ledger extends EventEmitter {
    storage: any;
    wallet: any;
    chain: string[];
    validBlocks: string[];
    pendingBlocks: Map<string, IValue>;
    clearedBlocks: Map<string, IValue>;
    invalidBlocks: string[];
    validTxs: Map<string, IValue>;
    invalidTxs: Set<string>;
    clearedBalances: Map<string, number>;
    clearedPledges: Map<string, IPledge>;
    clearedContracts: Map<string, IContract>;
    pendingBalances: Map<string, number>;
    pendingPledges: Map<string, IPledge>;
    pendingContracts: Map<string, IContract>;
    clearedSpacePledged: number;
    clearedMutableReserved: number;
    clearedImmutableReserved: number;
    clearedSpaceAvailable: number;
    clearedHostCount: number;
    clearedCreditSupply: number;
    clearedMutableCost: number;
    clearedImmutableCost: number;
    pendingSpacePledged: number;
    pendingMutableReserved: number;
    pendingImmutableReserved: number;
    pendingSpaceAvailable: number;
    pendingHostCount: number;
    pendingCreditSupply: number;
    pendingMutableCost: number;
    pendingImmutableCost: number;
    isFarming: boolean;
    hasLedger: boolean;
    constructor(storage: any, wallet: any);
    static getMutableCost(creditSupply: number, spaceAvailable: number): number;
    static getImmutableCost(mutableCost: number, mutableReserved: number, immutableReserved: number): number;
    computeMutableCost(creditSupply: number, spaceAvailable: number): number;
    computeImmutableCost(mutableCost: number, mutableReserved: number, immutableReserved: number): number;
    computeHostPayment(uptime: number, spacePledged: number, interval: number, pledgeTxId: string): Promise<number>;
    private isBestBlockSolution;
    getBalance(address: string): number;
    getHeight(): number;
    getLastBlockId(): string;
    bootstrap(spacePledged?: number, pledgeInterval?: number): Promise<void>;
    private computeSolution;
    private createBlock;
    onTx(record: Record): Promise<{
        valid: boolean;
        reason: string;
    }>;
    private applyTx;
    onBlock(record: Record): Promise<{
        valid: boolean;
        reason: string;
    }>;
    applyBlock(block: Record): Promise<void>;
    createRewardTx(receiver: string, immutableCost: number, previousBlock: string): Tx;
    createCreditTx(sender: string, receiver: string, amount: number): Promise<Record>;
    createPledgeTx(sender: string, pledge: any, interval?: number, immutableCost?: number): Promise<Record>;
    createNexusTx(sender: string, pledgeTx: string, amount: number, immutableCost: number): Promise<Record>;
    createImmutableContractTx(sender: string, immutableCost: number, senderBalance: number, spaceReserved: number, records: Set<string>, privateKeyObject: any, multiplier?: number): Promise<Tx>;
    createMutableContractTx(spaceReserved: number, replicationFactor: number, ttl: number, contractSig: string, contractId: string): Promise<Record>;
}
export declare class Block {
    _value: {
        height: number;
        previousBlock: string;
        spacePledged: number;
        immutableReserved: number;
        mutableReserved: number;
        immutableCost: number;
        mutableCost: number;
        creditSupply: number;
        hostCount: number;
        txSet: Set<string>;
        solution: string;
        pledge: number;
        publicKey: string;
        signature: string;
    };
    constructor(value: Block['value']);
    readonly value: {
        height: number;
        previousBlock: string;
        spacePledged: number;
        immutableReserved: number;
        mutableReserved: number;
        immutableCost: number;
        mutableCost: number;
        creditSupply: number;
        hostCount: number;
        txSet: Set<string>;
        solution: string;
        pledge: number;
        publicKey: string;
        signature: string;
    };
    static create(blockData: Block['value']): Promise<Block>;
    addTx(tx: string): void;
    setImmutableCost(cost: number): void;
    setMutableCost(cost: number): void;
    addRewardTx(rewardRecord: Record): void;
    addPledgeTx(pledgeRecord: Record): void;
    isValidGenesisBlock(block: Record): Promise<{
        valid: boolean;
        reason: string;
    }>;
    isValid(newBlock: Record, previousBlock: {
        key: string;
        value: Block['value'];
    }): Promise<{
        valid: boolean;
        reason: string;
    }>;
    getBestSolution(plot: Set<string>): string;
    isValidSolution(publicKey: string): boolean;
    getTimeDelay(seed?: string): number;
    sign(privateKeyObject: any): Promise<void>;
    isValidSignature(): Promise<boolean>;
}
export declare class Tx {
    _value: {
        type: string;
        sender: string;
        receiver: string;
        amount: number;
        cost: number;
        signature: string;
        previousBlock?: string;
        pledgeProof?: string;
        spacePledged?: number;
        pledgeInterval?: number;
        pledgeTx?: string;
        spaceReserved?: number;
        ttl?: number;
        replicationFactor?: number;
        recordIndex?: Set<string>;
        contractSig?: string;
        contractId?: string;
    };
    constructor(value: Tx['value']);
    readonly value: {
        type: string;
        sender: string;
        receiver: string;
        amount: number;
        cost: number;
        signature: string;
        previousBlock?: string;
        pledgeProof?: string;
        spacePledged?: number;
        pledgeInterval?: number;
        pledgeTx?: string;
        spaceReserved?: number;
        ttl?: number;
        replicationFactor?: number;
        recordIndex?: Set<string>;
        contractSig?: string;
        contractId?: string;
    };
    static createRewardTx(receiver: string, previousBlock: string, immutableCost: number): Tx;
    static createCreditTx(sender: string, receiver: string, amount: number, immutableCost: number, privateKeyObject: any): Promise<Tx>;
    static createPledgeTx(pledge: any, interval: number, immutableCost: number, privateKeyObject: any): Promise<Tx>;
    static createNexusTx(sender: string, amount: number, pledgeTx: string, immutableCost: number): Tx;
    static createImmutableContractTx(sender: string, cost: number, records: Set<string>, immutableCost: number, multiplier: number, privateKeyObject: any): Promise<Tx>;
    static createMutableContractTx(sender: string, cost: number, spaceReserved: number, replicationFactor: number, ttl: number, contractSig: string, contractId: string, immutableCost: number, privateKeyObject: any): Promise<Tx>;
    isValid(size: number, immutableCost: number, mutableCost?: number, senderBalance?: number, hostCount?: number): Promise<{
        valid: boolean;
        reason: string;
    }>;
    isValidPledgeTx(response: any): any;
    isValidContractTx(response: any, hostCount: number, mutableCost: number, immutableCost: number): Promise<any>;
    isValidNexusTx(response: any): any;
    isValidRewardTx(response: any): any;
    getCost(immutableCost: number, incentiveMultiplier: number): number;
    isValidSignature(): Promise<boolean>;
    private setCost;
    private sign;
}
