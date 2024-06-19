import { z } from 'zod';

import {
  ArbL2ToL1Ism,
  IAggregationIsm,
  IMultisigIsm,
  IRoutingIsm,
  OPStackIsm,
  PausableIsm,
  TestIsm,
  TrustedRelayerIsm,
} from '@hyperlane-xyz/core';
import type { Address, Domain, ValueOf } from '@hyperlane-xyz/utils';

import { OwnableConfig } from '../deploy/types.js';
import { ChainMap } from '../types.js';

import {
  ArbL2ToL1IsmConfigSchema,
  IsmConfigSchema,
  MultisigIsmConfigSchema,
  OpStackIsmConfigSchema,
  PausableIsmConfigSchema,
  TestIsmConfigSchema,
  TrustedRelayerIsmConfigSchema,
} from './schemas.js';

// this enum should match the IInterchainSecurityModule.sol enum
// meant for the relayer
export enum ModuleType {
  UNUSED,
  ROUTING,
  AGGREGATION,
  LEGACY_MULTISIG, // DEPRECATED
  MERKLE_ROOT_MULTISIG,
  MESSAGE_ID_MULTISIG,
  NULL,
  CCIP_READ,
  ARB_L2_TO_L1,
}

// this enum can be adjusted as per deployments necessary
// meant for the deployer and checker
export enum IsmType {
  OP_STACK = 'opStackIsm',
  ROUTING = 'domainRoutingIsm',
  FALLBACK_ROUTING = 'defaultFallbackRoutingIsm',
  AGGREGATION = 'staticAggregationIsm',
  MERKLE_ROOT_MULTISIG = 'merkleRootMultisigIsm',
  MESSAGE_ID_MULTISIG = 'messageIdMultisigIsm',
  TEST_ISM = 'testIsm',
  PAUSABLE = 'pausableIsm',
  TRUSTED_RELAYER = 'trustedRelayerIsm',
  ARB_L2_TO_L1 = 'arbL2ToL1Ism',
}

// mapping between the two enums
export function ismTypeToModuleType(ismType: IsmType): ModuleType {
  switch (ismType) {
    case IsmType.ROUTING:
      return ModuleType.ROUTING;
    case IsmType.FALLBACK_ROUTING:
      return ModuleType.ROUTING;
    case IsmType.AGGREGATION:
      return ModuleType.AGGREGATION;
    case IsmType.MERKLE_ROOT_MULTISIG:
      return ModuleType.MERKLE_ROOT_MULTISIG;
    case IsmType.MESSAGE_ID_MULTISIG:
      return ModuleType.MESSAGE_ID_MULTISIG;
    case IsmType.OP_STACK:
    case IsmType.TEST_ISM:
    case IsmType.PAUSABLE:
    case IsmType.TRUSTED_RELAYER:
      return ModuleType.NULL;
    case IsmType.ARB_L2_TO_L1:
      return ModuleType.ARB_L2_TO_L1;
  }
}

export type MultisigConfig = {
  validators: Array<Address>;
  threshold: number;
};

export type MultisigIsmConfig = z.infer<typeof MultisigIsmConfigSchema>;
export type TestIsmConfig = z.infer<typeof TestIsmConfigSchema>;
export type PausableIsmConfig = z.infer<typeof PausableIsmConfigSchema>;
export type OpStackIsmConfig = z.infer<typeof OpStackIsmConfigSchema>;
export type TrustedRelayerIsmConfig = z.infer<
  typeof TrustedRelayerIsmConfigSchema
>;
export type ArbL2ToL1IsmConfig = z.infer<typeof ArbL2ToL1IsmConfigSchema>;

export type NullIsmConfig =
  | TestIsmConfig
  | PausableIsmConfig
  | OpStackIsmConfig
  | TrustedRelayerIsmConfig;

export type RoutingIsmConfig = OwnableConfig & {
  type: IsmType.ROUTING | IsmType.FALLBACK_ROUTING;
  domains: ChainMap<IsmConfig>;
};

export type AggregationIsmConfig = {
  type: IsmType.AGGREGATION;
  modules: Array<IsmConfig>;
  threshold: number;
};

export type IsmConfig = Address | z.infer<typeof IsmConfigSchema>;

export type DeployedIsmType = {
  [IsmType.ROUTING]: IRoutingIsm;
  [IsmType.FALLBACK_ROUTING]: IRoutingIsm;
  [IsmType.AGGREGATION]: IAggregationIsm;
  [IsmType.MERKLE_ROOT_MULTISIG]: IMultisigIsm;
  [IsmType.MESSAGE_ID_MULTISIG]: IMultisigIsm;
  [IsmType.OP_STACK]: OPStackIsm;
  [IsmType.TEST_ISM]: TestIsm;
  [IsmType.PAUSABLE]: PausableIsm;
  [IsmType.TRUSTED_RELAYER]: TrustedRelayerIsm;
  [IsmType.ARB_L2_TO_L1]: ArbL2ToL1Ism;
};

export type DeployedIsm = ValueOf<DeployedIsmType>;

// for finding the difference between the onchain deployment and the config provided
export type RoutingIsmDelta = {
  domainsToUnenroll: Domain[]; // new or updated isms for the domain
  domainsToEnroll: Domain[]; // isms to remove
  owner?: Address; // is the owner different
  mailbox?: Address; // is the mailbox different (only for fallback routing)
};
