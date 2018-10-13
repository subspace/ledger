import crypto from '@subspace/crypto'
import * as I from './interfaces'
import { EventEmitter } from 'events'
import { getClosestIdByXor } from '@subspace/utils'



export default class Ledger extends EventEmitter {


  // ToDo

    // Determine when to farm the next block 
    // Bootstrap the chain
    // Join an existing chain
    // decide what to do with utxo/stats functions

    // cacluclate costs correclty
      // cost of mutable storage
      // cost of immutable storage
      // nexus payment

    // expire the pledges (later)
      // remove from pledges
      // adjust space pledged
      // have host submit their own pledge payment request

    // expire the contracts (later)
      // remove contracts
      // adjust space reserved
      // adjust space available 

  interfaces: any
  plot: string[]
  chain: string[]
  validBlocks: string[]
  invalidBlocks: string[]  
  validTxs: string[] 
  invalidTxs: string[]

  balances: Map <string, number> 
  pledges: Map <string, I.PledgeData>
  contracts: Map <string, I.ContractData>

  spacePledged: number
  mutableStorageReserved: number
  immutableStorageReserved: number
  spaceAvailable: number

  creditSupply: number
  costOfMutableStorage: number
  costOfImmutableStorage: number
  hostCount: number

  constructor(
    public storage: any, 
    public profile: any,
    public tracker: any
  ) {
    super()
    this.interfaces = I
    this.plot = null
    this.chain = []
    this.validBlocks = []
    this.invalidBlocks = []
    this.validTxs = []
    this.invalidTxs = []

    this.balances = new Map()
    this.pledges = new Map()
    this.contracts = new Map()

    this.spacePledged = 0
    this.mutableStorageReserved = 0
    this.immutableStorageReserved = 0
    this.spaceAvailable = 0

    this.creditSupply = 0
    this.costOfMutableStorage = Infinity
    this.costOfImmutableStorage = Infinity
    this.hostCount = 0
  }

  public init() {
    // on startup
      // check for a saved plot 
      // check for a saved chain
      // get all blocks from network outstanding (work backwards)
      // get all pending tx from network 
      // compute the balances (UTXO)
      // calculate the cost of storage
  }

  public async bootstrap() {
    try {
      // create the genesis block 
      // Single farmer chain to start
      // create a pledge (proof of space)
      // construct the genesis block (with coinbase tx)
      // publish the block (gossip)
      // farm the next block solution (compute best solution)
      // ...
      const block = await this.createBlock()
      this.emit('proposed-block', block)
      this.onBlock(block)
      this.farm()
    } 
    catch (error) {
      console.log('Error creating proof of space pledge')
      console.log(error)
      this.emit(error)
      return error
    }
    
  }

  public async farm() {
    try {

      // get the blockchain from other or gateway 

      

    // on final block
      // start a timer of max time (11 minutes)
      // find my best solution
        // convert solution to sum of hex as numbers
        // wait that long in seconds
        // if best solution yet then publish my block
      // listen for other valid blocks
      // if better than my solution, hold
        // discard my block
        // wait until timer expires
        // or a better solution is proposed
  
      
    }
    catch (error) {

    }
  }

  public async stopFarming() {

  }

  private computeStats() {
    // returns
      // total number of valid hosts 
      // total number of credits
      // total amount of space pledged (active)
      // total amount of mutable storage reserved (active)
      // total amount of immutable storage reserve
      // cost of mutable storage
      // cost of immutable storage 
      // balance for each address

    // for each block
      // add coinbase to block winner
      // for each tx
        // debit balance of sender
        // credit balance of receiver

    // compute UTXO
        // if address in UTXO, mutate balance
        // else add address and set balance

    // calculate the cost of storage
  }

  public getBalance(address: string) {
    return this.balances.get(address)
  }

  public getBlockHeight() {
    return this.chain.length - 1
  }

  private calculateTxFee(tx: I.Tx) {
    const size = Buffer.byteLength(JSON.stringify(tx.value))
    const creditsPerByte = .000000001
    const fee = (size + 40) * creditsPerByte
    return fee
  }

  private calculateCostofMutableStorage() {
    this.costOfMutableStorage = (this.creditSupply / this.spaceAvailable)
  }

  private calculateCostOfImmutableStorage() {
    this.costOfImmutableStorage = this.costOfMutableStorage * 10
  }

  private calculateNexusPayments() {

    // Needs work!

    // Nexus Payment
      // average space utilized over all blocks in interval
      // average CoS over all blocks in interval
      // uptime over the interval (from tracker)
      // amount of space provided by host as a proportion of all space

    // average utilization * uptime(from tracker) * average cost of storage
    // for each block 
      // calculate the proportion of space used
      // calculate the cost of storage

    const payments: I.NexusScript[] = []

    // each block check the pledges to see which are due
    const blockHeight = this.getBlockHeight()
    const pledges: I.PledgeData[] = []
    this.pledges.forEach(pledge => {
      if (pledge.blockDue === blockHeight) {
        pledges.push(pledge)
        pledge.blockDue = Math.floor(pledge.interval / 60000)
      } 
    })

    if (pledges.length === 0) {
      return payments
    }

    // assume all intervals are the same for hosts (1 month)
    // 1 min * 60 * 24 * 30 = 43,200 blocks
    // for each block 
      // average space reserved
      // average CoS
    
    let sumImmutableSpaceReserved = 0
    let sumMutableSpaceReserved = 0
    let sumCostofImmutableStorage = 0
    let sumCostofMutableStorage = 0
    let sumSpacePledged = 0

    for (let i = blockHeight; i -- ; i = blockHeight - 43200 ) {
      const block = this.storage.get(this.chain[i])
      sumImmutableSpaceReserved += block.immutableSpaceReserved
      sumMutableSpaceReserved += block.mutableSpaceReserved
      sumCostofImmutableStorage += block.costOfImmutableStorage
      sumCostofMutableStorage += block.costOfMutableStorage
      sumSpacePledged += block.spacePledged
    }

    const avgMutableValue = (sumCostofMutableStorage / 43200 ) / (sumMutableSpaceReserved / 43200)
    const avgImmutableValue = (sumCostofImmutableStorage / 43200) / (sumImmutableSpaceReserved / 43200)

    const mutableRatio = sumMutableSpaceReserved / sumSpacePledged
    const immutableRatio = sumImmutableSpaceReserved / sumSpacePledged

    const totalValue = avgMutableValue * mutableRatio + avgImmutableValue * immutableRatio

    pledges.forEach(pledge => {

      const hostData = this.tracker.get(pledge.host)
      const spaceFraction = pledge.size / sumSpacePledged
      const timeFraction = hostData.uptime / (2592000000)
      const myValue = totalValue * spaceFraction * timeFraction
      const payment = {
        receiver: pledge.host,
        amount: myValue,
        contract: pledge.pledge
      }
      payments.push(payment)
    })

    return payments
  }

  private createProofOfTime(solution: string) {
    // calculates the time required for a given solution to process
    // converts each hex char to a number value between 1 and 16
    // sums the value for each char in the solution
    // this determines the time to wait before publishing block in seconds
    let time = 0
    for (let char of solution) {
      let num = parseInt(char)
      if (isNaN(num)) {
        switch(char) {
          case('a'): num = 11
          case('b'): num = 12
          case('c'): num = 13
          case('d'): num = 14
          case('e'): num = 15
          case('f'): num = 16
        }
      } else {
        num ++
      }
      time += num  
    }

    return time * 1000
  }

  private isValidProofOfTime(solution: string, time: number) {
    return (time === this.createProofOfTime(solution) ? true : false)
  }

  public async createProofOfSpace(key: string = null, size = 10): Promise <I.Proof> {
    return new Promise <I.Proof> ( async (resolve, reject) => {
      try {
        const proofArray: string[] = []
        const hashCount: number = size * 1000
  
        if (!key)  key = this.profile.activeKeyPair.publicKeyArmored
        
        for (let i: number = 0; i < hashCount; i++) {
          key = crypto.getHash(key)
          proofArray.push(key)
        }
  
        const proof: I.Proof = {
          id: crypto.getHash(JSON.stringify(proofArray)),
          size: size,
          seed: key,
          plot: proofArray,
          createdAt: Date.now()
        }
  
        resolve(proof)
      }
      catch (error) {
        console.log('Error creating proof of space pledge')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private async isValidProofofSpace(key:string, space: number, proofHash: string): Promise <boolean> {
    return new Promise <boolean> ( async (resolve, reject) => {
      try {
        const proof = await this.createProofOfSpace(key, space)
        proof.id === proofHash ? resolve(true): resolve(false)
      }
      catch (error) {
        console.log('Error validating proof of space pledge')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private getBestSolution(challenge: string, plot: string[] = this.plot) {
    // checks your plot to find the closest solution by XOR
    const bufferedPlot = plot.map(solution => Buffer.from(solution))
    const bufferChallnege = Buffer.from(challenge)
    const bufferSoltuion = getClosestIdByXor(bufferChallnege, bufferedPlot)
    return bufferSoltuion.toString()
  }

  private isValidSolution(solution: string, pledge: number, challenge: string, key: string): Promise <boolean> {
    // check if this solution is valid
    return new Promise <boolean> (async (resolve, reject) => {
      try {
        const proof = await this.createProofOfSpace(key, pledge)
        const mySolution = this.getBestSolution(challenge, proof.plot)
        solution === mySolution ? resolve(true) : resolve(false)
      }
      catch(error) {
        console.log('Error validating block solution')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private isBestSolution(challenge: string, solution: string) {
    // check to see if the solution provided is the best solution for this block

    const bestSolution = this.validBlocks[0]
    if (bestSolution) {
      const source = Buffer.from(challenge)
      const contender = Buffer.from(bestSolution)
      const challenger = Buffer.from(solution)
      const targets = [contender, challenger]
      const closest = getClosestIdByXor(source, targets)
      if (contender === closest) return false
    }
    return true 
  }

  private createBlock(): Promise <I.Block> {
    return new Promise <I.Block> (async (resolve, reject) => {
      try {

        this.calculateCostofMutableStorage()
        this.calculateCostOfImmutableStorage()

        let solution = null
        let lastBlockHash: string = null
        let time = null
        if (this.chain.length > 0) {
          lastBlockHash = this.chain[this.chain.length - 1]
          solution = this.getBestSolution(lastBlockHash)
          time = this.createProofOfTime(solution)
        }

        let block: I.Block = {
          key: null,
          value: {
            height: this.getBlockHeight() + 1,
            lastBlock: lastBlockHash,
            solution: solution,
            time: time,
            pledge: this.profile.proof.size,
            timestamp: Date.now(),
            reward: null,
            nexus: [],
            txs: this.validTxs,
            key: this.profile.activeKeyPair.publicKeyArmored,
            spacePledged: this.spacePledged, 
            immutableSpaceReserved: this.immutableStorageReserved,
            mutableSpaceReserved: this.mutableStorageReserved,
            costOfMutableStorage: this.costOfMutableStorage,
            costOfImmutableStorage: this.costOfImmutableStorage,
            signature: null
          }
        }

        block.value.reward = await this.createRewardTx()
        const nexusPayments: I.NexusScript[] = this.calculateNexusPayments()
        nexusPayments.forEach(async (payment) => {
          const nexusTx = await this.createNexusTx(payment.receiver, payment.amount, payment.contract)  
          block.value.nexus.push(nexusTx)
        })

        block.value.signature = await crypto.sign(block.value, this.profile.activeKeyPair.privateKeyObject)
        block.key = crypto.getHash(JSON.stringify(block.value))
        resolve(block)
      }
      catch (error) {
        console.log('Error creating new block')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })

  }

  private isValidBlock(block: I.Block): Promise <boolean> {
    return new Promise <boolean> (async (resolve, reject) => {
      try {

        // has valid id (hash of value)
        if (!(crypto.isValidHash(
          block.key, 
          JSON.stringify(block.value)
        ))) resolve(false)

        let unsignedBlock = { ...block.value }
        unsignedBlock.signature = null
      
        // has valid signature
        if (!(await crypto.isValidSignature(
          JSON.stringify(unsignedBlock),
          block.value.signature,
          block.value.key
        ))) resolve(false)

        // references the last block
        if (block.value.lastBlock) {
          if (
            block.value.lastBlock !== 
            this.chain[this.chain.length - 1]
          ) resolve(false)
        }

        // solution is valid 
        if (!(await this.isValidSolution(
          block.value.solution,
          block.value.pledge,
          block.value.lastBlock,
          block.value.key
        ))) resolve(false)

        // timestamp is valid
        if(!(crypto.isDateWithinRange(
          block.value.timestamp,
          600000
        ))) resolve(false)

        // validate the nexus txs
        block.value.nexus.forEach(async (tx) => {
          if(!(await this.onTx(tx))) resolve(false)
        })

        // validate the cost of mutable storage
        // validate the cost of immutable storage
        // validate the space pledged
        // validate the space reserved
        
        // validate the reward tx
        if(!(await this.onTx(block.value.reward))) resolve(false)

        // references valid txs (already received via gossip)
        block.value.txs.forEach(tx => {
          if (!this.validTxs.includes(tx)) {
            resolve(false)
          }
        })

        resolve(true)
      }
      catch(error) {
        console.log('Error validating new block')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  public onBlock(block: I.Block): Promise <boolean> { 
    return new Promise <boolean> (async (resolve, reject) => {
      try {
        
        // is this a new block?
        if (this.validBlocks.includes(block.key) || this.invalidBlocks.includes(block.key)) {
          resolve(false)
        }

        // is the block valid?
        if (!(await this.isValidBlock(block))) {
          this.invalidBlocks.push(block.key)
          resolve(false)
        }
          
        // is it the best solution proposed?
        if (!(await this.isBestSolution(
          block.value.lastBlock, 
          block.value.solution
        ))) {
          this.validBlocks.push(block.key)
          resolve(false)
        }

        this.validBlocks.unshift(block.key)
        this.storage.put(block.key, JSON.stringify(block.value))
        resolve(true)

        // how do you know when you have the best block?
        // on block confirmation
          // remove all valid tx in this block
          // update the utxo/balances
      }
      catch(error) {
        console.log('Error processing new block')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    }) 
  }

  public createTx(type = 'credit', address: string, amount = 0, script: any = null): Promise <I.Tx> {
    return new Promise <I.Tx> (async (resolve, reject) => {
      try {

        const tx: I.Tx = {
          key: null,
          value: {
            type: type,
            sender: this.profile.activeKeyPair.publicKeyArmored,
            receiver: address, 
            amount: amount,
            fee: null,
            script: script,
            timeStamp: Date.now(),
            signature: null
          }
        }

        if (tx.value.type !== 'pledge') {
          tx.value.fee = this.calculateTxFee(tx)

          if (!(
            (amount + tx.value.fee) <= 
            this.getBalance(this.profile.hexId
          ))) reject()
        }
       
        tx.value.signature = await crypto.sign(tx.value, this.profile.activeKeyPair.privateKeyObject)
        tx.key = crypto.getHash(JSON.stringify(tx.value))
        resolve(tx) 

        // this balance will be reduced once the tx is added to the pool
      }
      catch(error) {
        console.log('Error creating new tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  public createPledgeTx(interval = 2628000000): Promise <I.Tx> {
    return new Promise <I.Tx> (async (resolve, reject) => {
      try {
        const proof = this.profile.proof.id 
        const size = this.profile.proof.size
        const pledge: I.PledgeScript = { proof, size, interval }
        const tx = await this.createTx('pledge', null, 0, pledge)
        resolve(tx)
      }
      catch(error) {
        console.log('Error creating pledge tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  public createContractTx(contract: I.Contract): Promise <I.Tx> {
    return new Promise <I.Tx> (async (resolve, reject) => {
      try {

        let cost
        if (contract.ttl) {  // mutable storage contract
          cost = this.costOfMutableStorage * contract.reserved * contract.replicas * contract.ttl
        } else {  // immutable storage contract
          cost = this.costOfImmutableStorage * contract.reserved
          contract.replicas = Math.floor(Math.log2(this.hostCount))
        }

        const contractScript: I.ContractScript = {
          key: contract.publicKeyArmored,
          size: contract.reserved,
          ttl: contract.ttl,
          replicas: contract.replicas,
          signature: null
        }

        // sign with the private key of contract (not profile)
        const privateKeyObject = await crypto.getPrivateKeyObject(contract.privateKeyArmored, contract.passphrase)
        contractScript.signature = await crypto.sign(contractScript, privateKeyObject)

        // create the tx 
        const nexusAddress = crypto.getHash('nexus')
        const tx = await this.createTx('contract', nexusAddress, cost, contractScript)
        resolve(tx)
      }
      catch(error) {
        this.emit(error)
        reject(error)
      }
    })
  }

  private async createRewardTx(): Promise <I.Tx> {
    return new Promise <I.Tx> (async (resolve, reject) => {
      try {
        const tx: I.Tx = {
          key: null,
          value: {
            type: 'reward',
            sender: null,
            receiver: this.profile.activeKeyPair.publicKeyArmored, 
            amount: 100,
            fee: 0,
            script: null,
            timeStamp: Date.now(),
            signature: null
          }
        }
        
        // skip signing so we can validate teh block hash
        tx.key = crypto.getHash(JSON.stringify(tx.value))
        resolve(tx) 
      }
      catch(error) {
        console.log('Error creating reward tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private async createNexusTx(receiver: string, amount: number, contract: string): Promise <I.Tx> {
    return new Promise <I.Tx> (async (resolve, reject) => {
      try {
        const tx: I.Tx = {
          key: null,
          value: {
            type: 'nexus',
            sender: crypto.getHash('nexus'),
            receiver: receiver, 
            amount: amount,
            fee: 0,
            script: contract,
            timeStamp: Date.now(),
            signature: null
          }
        }

        tx.value.fee = this.calculateTxFee(tx)
        tx.value.amount -= tx.value.fee
        // skip signing sense we can validate the block hash
        tx.key = crypto.getHash(JSON.stringify(tx.value))
        resolve(tx) 
      }
      catch(error) {
        console.log('Error creating nexus tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private isValidTx(tx: I.Tx): Promise <boolean> {
    return new Promise <boolean> (async (resolve, reject) => {
      try {

        // hash valid id (value hash)
        if (
          tx.key !== 
          crypto.getHash(JSON.stringify(tx.value)
        )) resolve(false)

        // address has funds to cover amount + fees
        if (tx.value.type !== 'reward' && tx.value.type !== 'nexus') {
          if ((
            tx.value.amount + tx.value.fee) >= 
            this.getBalance(crypto.getHash(tx.value.sender))
          ) resolve(false)
        }
        
        const preFeeTx = { ...tx }
        preFeeTx.value.fee = null
        preFeeTx.value.signature = null

        // has correct tx fee
        if (tx.value.type !== 'pledge' && tx.value.type !== 'reward') {
          if (tx.value.fee !== this.calculateTxFee(preFeeTx)) 
          resolve(false)
        }
      
        // has valid timestamp
        if (!(crypto.isDateWithinRange(tx.value.timeStamp, 600000))) 
          resolve(false)

        // validation for special tx types
        let valid
        switch(tx.value.type) {
          case('pledge'): valid = await this.isValidPledgeTx(tx)
          case('contract'): valid = await this.isValidContractTx(tx)
          case('nexus'): valid = await this.isValidNexusTx(tx)
          case('reward'): valid = await this.isValidRewardTx(tx)
          default: valid = true
        }
        if (!valid) resolve(false)

        const preSignedTx = { ...tx }
        preSignedTx.value.signature = null

        // has valid signature
        if (tx.value.type !== 'nexus' && tx.value.type !== 'reward') {
          if (!(await crypto.isValidSignature(
            preSignedTx.value, 
            tx.value.signature, 
            tx.value.sender
          ))) resolve(false)
        }
        resolve(true)
      }
      catch(error) {
        console.log('Error validating tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private isValidPledgeTx(tx: I.Tx): Promise <boolean> {
    return new Promise <boolean> (async (resolve, reject) => {
      try {
        // validate pledge (proof of space)
        const valid = await this.isValidProofofSpace(tx.value.sender, tx.value.script.size, tx.value.script.proof)
        if (!valid) resolve(false)

        // size within range 10 GB to 1 TB
        if (!(tx.value.script.size >= 10 || tx.value.script.size <= 1000))
          resolve(false)

        // payment interval within range one month to one year (ms)
        if (!(tx.value.script.interval >= 2628000000 || tx.value.script.interval <= 31536000000))
          resolve(false)

        resolve(true)
      }
      catch(error) {
        console.log('Error validating pledge tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private isValidContractTx(tx: I.Tx): Promise <boolean> {
    return new Promise <boolean> (async (resolve, reject) => {
      try {
  
        if (tx.value.script.ttl) {  // mutable storage contract
          
          // validate TTL within range
          if (!(
            tx.value.script.ttl >= 3600000 ||   // 1 hour
            tx.value.script.ttl <= 31536000000  // 1 year
          )) resolve(false)

          // validate replicas within range
          if (!(
            tx.value.script.replicas >= 2 
            || tx.value.script.replicas <= Math.log2(this.hostCount)
          )) resolve(false)

          // validate size within range
          if (!(
            tx.value.script.size >= 1 ||  // 1 GB
            tx.value.script.size <= (.01 * this.spaceAvailable)
          )) resolve(false)

          // validate the cost 
          if (tx.value.amount !== 
            (this.costOfMutableStorage * tx.value.script.size * tx.value.script.replicas * tx.value.script.ttl)
          ) resolve(false)


        } else {  // immutable storage contract

          // validate size within range
          if (!(
            tx.value.script.size >= .001 || // 1 MB  
            tx.value.script.size <= (.001 * this.spaceAvailable)
          )) resolve(false)

          // validate the cost
          if (tx.value.amount !== 
            (this.costOfImmutableStorage * tx.value.script.size * tx.value.script.replicas)
          ) resolve(false)

        }

        // validate contract signature 
        const script = { ...tx.value.script }
        script.signature = null

        if (!(await crypto.isValidSignature(
          script, 
          tx.value.script.signature, 
          tx.value.script.key
        ))) resolve(false)

        resolve(true)
      }
      catch(error) {
        console.log('Error validating contract tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private isValidNexusTx(tx: I.Tx): Promise <boolean> {
    return new Promise <boolean> (async (resolve, reject) => {
      try {

        // does sender = nexus
        if (!(crypto.getHash('nexus') === tx.value.sender)) 
          resolve(false)

        // does the recipient have a host contract?
        if(!this.contracts.has(tx.value.script)) resolve(false)

        // is the payment amount valid (later)

        resolve(true)
      }
      catch(error) {
        console.log('Error validating nexus tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  private isValidRewardTx(tx: I.Tx): Promise <boolean> {
    return new Promise <boolean> (async (resolve, reject) => {
      try {

        // has null sender
        if(!tx.value.sender === null) resolve(false)

        // is less than or equal to 100 credits
        if(tx.value.amount > 100) resolve(false)

        // is the block creator, how to know?
        // have to validate at block validation 

        resolve(true)
      }
      catch(error) {
        console.log('Error validating reward tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })
  }

  public onTx(tx: I.Tx): Promise <boolean> {
    return new Promise <boolean> (async (resolve, reject) => {
      try {
        // is this a new tx?
        if (this.validTxs.includes(tx.key) || this.invalidTxs.includes(tx.key))
          resolve(false)

        // it tx valid?
        if (!(await this.isValidTx(tx))) {
          this.invalidTxs.push(tx.key)
          resolve(false)
        }
      
        const nexusAddress = crypto.getHash('nexus')
        switch(tx.value.type) {
          case('credit'):
            // credit the recipient
            if (this.balances.has(tx.value.receiver)) {
              let receiverBalance = this.balances.get(tx.value.receiver)
              receiverBalance += tx.value.amount
              this.balances.set(tx.value.receiver, receiverBalance)
            } else {
              this.balances.set(tx.value.receiver, tx.value.amount)
            }

            // debit the sender
            const senderAddress = crypto.getHash(tx.value.sender)
            let senderBalance = this.balances.get(senderAddress)
            senderBalance -= tx.value.amount
            this.balances.set(senderAddress, senderBalance)
            break
          case('pledge'):
            // add the pledge to pledges
            this.pledges.set(
              tx.value.script.proof, {
                host: tx.value.sender,
                blockDue: Math.floor(tx.value.script.interval / 60000),
                size: tx.value.script.size,
                interval: tx.value.script.interval,
                pledge: tx.key
              })

              // adjust space pledged
              this.spacePledged += tx.value.script.size
              this.spaceAvailable += tx.value.script.size
            break
          case('contract'):
            // add the conttract to contracts
            this.contracts.set(
              tx.value.script.key, {
                client: tx.value.sender,
                size: tx.value.script.size,
                ttl: tx.value.script.ttl
              }
            )

            // credit nexus
            if (this.balances.has(nexusAddress)) {
              let nexusBalance = this.balances.get(nexusAddress)
              nexusBalance += tx.value.amount
              this.balances.set(nexusAddress, nexusBalance)
            } else {
              this.balances.set(nexusAddress, tx.value.amount)
            }

            // debit reserver
            const reserverAddress = crypto.getHash(tx.value.sender)
            let reserverBalance = this.balances.get(reserverAddress)
            reserverBalance -= tx.value.amount
            this.balances.set(reserverAddress, reserverBalance)

            // adjust space reserved and available
            if (tx.value.script.ttl) {
              this.mutableStorageReserved += tx.value.script.size
            } else {
              this.immutableStorageReserved += tx.value.script.size
            }
            this.spaceAvailable -= tx.value.script.size

            break
          case('nexus'):
            // debit nexus
            let nexusBalance = this.balances.get(nexusAddress)
            nexusBalance -= tx.value.amount
            this.balances.set(nexusAddress, nexusBalance)

            // credit host 
            if (this.balances.has(tx.value.receiver)) {
              let hostBalance = this.balances.get(tx.value.receiver)
              hostBalance += tx.value.amount
              this.balances.set(tx.value.receiver, hostBalance)
            } else {
              this.balances.set(tx.value.receiver, tx.value.amount)
            }

            break
          case('reward'):
            // credit the winner
            if (this.balances.has(tx.value.receiver)) {
              let receiverBalance = this.balances.get(tx.value.receiver)
              receiverBalance += tx.value.amount
              this.balances.set(tx.value.receiver, receiverBalance)
            } else {
              this.balances.set(tx.value.receiver, tx.value.amount)
            }
            
            // update the credit supply
            this.creditSupply += tx.value.amount
      
          default:
            // handle error
            break
        }

        this.validTxs.push(tx.key)
        this.storage.put(tx.key, JSON.stringify(tx.value))
        resolve(true)
      }
      catch(error) {
        console.log('Error processing new tx')
        console.log(error)
        this.emit(error)
        reject(error)
      }
    })  
  }

}    