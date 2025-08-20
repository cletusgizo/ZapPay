#[starknet::contract]
pub mod STRKPaymentContract {
    use starknet::storage::StorageMapWriteAccess;
use starknet::storage::StorageMapReadAccess;
use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::security::pausable::PausableComponent;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    
    use starknet::storage::{
        Map, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{
        ContractAddress, get_block_timestamp, get_caller_address,
    };

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);

    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // Pausable Mixin
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        strk_token_address: ContractAddress, // Address of existing STRK token
        network_fee: u256,
        fee_recipient: ContractAddress,
        total_transactions: u256,
        user_transaction_count: Map<ContractAddress, u256>,
        transaction_history: Map<u256, TransactionRecord>,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
    }

    #[derive(Drop, Serde, starknet::Store)]
    pub struct TransactionRecord {
        pub from: ContractAddress,
        pub to: ContractAddress,
        pub amount: u256,
        pub fee: u256,
        pub timestamp: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        PaymentSent: PaymentSent,
        FeeUpdated: FeeUpdated,
        FeeRecipientUpdated: FeeRecipientUpdated,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PaymentSent {
        pub from: ContractAddress,
        pub to: ContractAddress,
        pub amount: u256,
        pub fee: u256,
        pub transaction_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct FeeUpdated {
        pub old_fee: u256,
        pub new_fee: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct FeeRecipientUpdated {
        pub old_recipient: ContractAddress,
        pub new_recipient: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        strk_token_address: ContractAddress, // Real STRK token address
        initial_fee: u256,
        fee_recipient: ContractAddress,
        owner: ContractAddress
    ) {
        self.strk_token_address.write(strk_token_address);
        self.network_fee.write(initial_fee);
        self.fee_recipient.write(fee_recipient);
        self.total_transactions.write(0);
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl STRKPaymentImpl of ISTRKPayment<ContractState> {
        fn send_payment(
            ref self: ContractState,
            recipient: ContractAddress,
            amount: u256
        ) -> u256 {
            // Check if contract is not paused
            self.pausable.assert_not_paused();
            
            let sender = get_caller_address();
            let fee = self.network_fee.read();
            let total_amount = amount + fee;
            
            // Get real STRK token dispatcher
            let strk_token = IERC20Dispatcher { contract_address: self.strk_token_address.read() };
            
            // Check sender has enough balance
            let sender_balance = strk_token.balance_of(sender);
            assert(sender_balance >= total_amount, 'Insufficient balance');
            
            // Transfer amount to recipient
            let transfer_success = strk_token.transfer_from(sender, recipient, amount);
            assert(transfer_success, 'Transfer to recipient failed');
            
            // Transfer fee to fee recipient (if fee > 0)
            if fee > 0 {
                let fee_recipient = self.fee_recipient.read();
                let fee_transfer_success = strk_token.transfer_from(sender, fee_recipient, fee);
                assert(fee_transfer_success, 'Fee transfer failed');
            }
            
            // Record transaction
            let transaction_id = self.total_transactions.read() + 1;
            let transaction_record = TransactionRecord {
                from: sender,
                to: recipient,
                amount: amount,
                fee: fee,
                timestamp: get_block_timestamp(),
            };
            
            self.transaction_history.write(transaction_id, transaction_record);
            self.total_transactions.write(transaction_id);
            
            // Update user transaction count
            let user_count = self.user_transaction_count.read(sender);
            self.user_transaction_count.write(sender, user_count + 1);
            
            // Emit event
            self.emit(PaymentSent {
                from: sender,
                to: recipient,
                amount: amount,
                fee: fee,
                transaction_id: transaction_id,
            });
            
            transaction_id
        }
        
        fn get_network_fee(self: @ContractState) -> u256 {
            self.network_fee.read()
        }
        
        fn get_total_amount(self: @ContractState, amount: u256) -> u256 {
            amount + self.network_fee.read()
        }
        
        fn get_strk_token(self: @ContractState) -> ContractAddress {
            self.strk_token_address.read()
        }
        
        fn get_transaction(self: @ContractState, transaction_id: u256) -> TransactionRecord {
            self.transaction_history.read(transaction_id)
        }
        
        fn get_user_transaction_count(self: @ContractState, user: ContractAddress) -> u256 {
            self.user_transaction_count.read(user)
        }
        
        fn get_total_transactions(self: @ContractState) -> u256 {
            self.total_transactions.read()
        }
    }

    // Owner-only functions
    #[abi(embed_v0)]
    impl OwnerFunctions of IOwnerFunctions<ContractState> {
        fn set_network_fee(ref self: ContractState, new_fee: u256) {
            self.ownable.assert_only_owner();
            let old_fee = self.network_fee.read();
            self.network_fee.write(new_fee);
            
            self.emit(FeeUpdated {
                old_fee: old_fee,
                new_fee: new_fee,
            });
        }
        
        fn set_fee_recipient(ref self: ContractState, new_recipient: ContractAddress) {
            self.ownable.assert_only_owner();
            let old_recipient = self.fee_recipient.read();
            self.fee_recipient.write(new_recipient);
            
            self.emit(FeeRecipientUpdated {
                old_recipient: old_recipient,
                new_recipient: new_recipient,
            });
        }
        
        fn pause(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.pause();
        }
        
        fn unpause(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.unpause();
        }
    }

    // Interfaces
    #[starknet::interface]
    trait ISTRKPayment<TContractState> {
        fn send_payment(ref self: TContractState, recipient: ContractAddress, amount: u256) -> u256;
        fn get_network_fee(self: @TContractState) -> u256;
        fn get_total_amount(self: @TContractState, amount: u256) -> u256;
        fn get_strk_token(self: @TContractState) -> ContractAddress;
        fn get_transaction(self: @TContractState, transaction_id: u256) -> TransactionRecord;
        fn get_user_transaction_count(self: @TContractState, user: ContractAddress) -> u256;
        fn get_total_transactions(self: @TContractState) -> u256;
    }

    #[starknet::interface]
    trait IOwnerFunctions<TContractState> {
        fn set_network_fee(ref self: TContractState, new_fee: u256);
        fn set_fee_recipient(ref self: TContractState, new_recipient: ContractAddress);
        fn pause(ref self: TContractState);
        fn unpause(ref self: TContractState);
    }
}