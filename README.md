# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/deploy.js
npx hardhat help
npm test
```

Connected with contract:
```
npx hardhat create_voting
npx hardhat withdraw
npx hardhat add_candidate
npx hardhat vote
npx hardhat end_voting
npx hardhat get_fee_amount
npx hardhat get_winner
npx hardhat get_all_candidates
npx hardhat get_number_votes
npx hardhat get_vote_of_participant
npx hardhat get_ended
npx hardhat get_total_amount
```

# Start project
1. git clone https://github.com/Kirill-Kuznetsov-git/Voting.git
2. cd Voting
3. npm install
4. npx hardhat compile
5. npx hardhat run scripts/deploy.js --network localhost
6. npm test

Then you can use tasks to use contract. I connected tasks to localhost.
Also contract connected to rinkeby and you can specify it by --network <network name>(example: npx hardhat test --network rinkeby)
It does not work for tasks. To change network for tasks you have to go to file tasks/tasks.js and change variable network from localhost to rinkeby.