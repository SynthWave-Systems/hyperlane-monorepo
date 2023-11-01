use crate::{
    grpc::{WasmGrpcProvider, WasmProvider},
    payloads::aggregate_ism::{ModulesAndThresholdRequest, ModulesAndThresholdResponse},
    verify::bech32_decode,
    ConnectionConf, CosmosProvider, Signer,
};
use async_trait::async_trait;
use hyperlane_core::{
    AggregationIsm, ChainResult, ContractLocator, HyperlaneChain, HyperlaneContract,
    HyperlaneDomain, HyperlaneMessage, HyperlaneProvider, H256,
};
use tracing::instrument;

/// A reference to an AggregationIsm contract on some Cosmos chain
#[derive(Debug)]
pub struct CosmosAggregationIsm {
    domain: HyperlaneDomain,
    address: H256,
    provider: Box<WasmGrpcProvider>,
}

impl CosmosAggregationIsm {
    /// create new Cosmos AggregationIsm agent
    pub fn new(conf: ConnectionConf, locator: ContractLocator, signer: Signer) -> Self {
        let provider = WasmGrpcProvider::new(conf.clone(), locator.clone(), signer.clone());

        Self {
            domain: locator.domain.clone(),
            address: locator.address,
            provider: Box::new(provider),
        }
    }
}

impl HyperlaneContract for CosmosAggregationIsm {
    fn address(&self) -> H256 {
        self.address
    }
}

impl HyperlaneChain for CosmosAggregationIsm {
    fn domain(&self) -> &HyperlaneDomain {
        &self.domain
    }

    fn provider(&self) -> Box<dyn HyperlaneProvider> {
        Box::new(CosmosProvider::new(self.domain.clone()))
    }
}

#[async_trait]
impl AggregationIsm for CosmosAggregationIsm {
    #[instrument(err)]
    async fn modules_and_threshold(
        &self,
        message: &HyperlaneMessage,
    ) -> ChainResult<(Vec<H256>, u8)> {
        let payload = ModulesAndThresholdRequest::new(message);

        let data = self.provider.wasm_query(payload, None).await?;
        let response: ModulesAndThresholdResponse = serde_json::from_slice(&data)?;

        let modules: Vec<H256> = response.modules.into_iter().map(bech32_decode).collect();

        Ok((modules, response.threshold))
    }
}