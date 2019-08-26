/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import styled, { ThemeContext } from 'styled-components';
import snxJSConnector from '../../helpers/snxJSConnector';
import { Store } from '../../store';

import { formatCurrency } from '../../helpers/formatters';
import Header from '../../components/Header';
import PieChart from '../../components/PieChart';
import Table from '../../components/Table';
import {
  DataLarge,
  DataSmall,
  DataHeaderLarge,
  H5,
  Figure,
  ButtonTertiaryLabel,
} from '../../components/Typography';
import { Info } from '../../components/Icons';

const bigNumberFormatter = value =>
  Number(snxJSConnector.utils.formatEther(value)).toFixed(2);

const getPrices = (prices, setPrices) => {
  useEffect(() => {
    const fetchPrices = async () => {
      const SNXBytes = snxJSConnector.utils.toUtf8Bytes4('SNX');
      const sUSDBytes = snxJSConnector.utils.toUtf8Bytes4('sUSD');
      const ETHBytes = snxJSConnector.utils.toUtf8Bytes4('ETH');
      const result = await snxJSConnector.snxJS.ExchangeRates.ratesForCurrencies(
        [SNXBytes, sUSDBytes, ETHBytes]
      );
      const [snx, sUSD, eth] = result.map(bigNumberFormatter);
      setPrices({ snx, sUSD, eth });
    };
    fetchPrices();
  }, []);
  return true;
};

const getBalances = (wallet, balances, setBalances) => {
  useEffect(() => {
    const fetchBalances = async () => {
      const result = await Promise.all([
        snxJSConnector.snxJS.Synthetix.collateral(wallet),
        snxJSConnector.snxJS.sUSD.balanceOf(wallet),
        snxJSConnector.provider.getBalance(wallet),
      ]);
      const [snx, sUSD, eth] = result.map(bigNumberFormatter);
      setBalances({ snx, sUSD, eth });
    };
    fetchBalances();
  }, []);
  return true;
};

const renderBalances = (balances, prices, theme) => {
  return (
    <BalanceRow>
      {['snx', 'sUSD', 'eth'].map(currency => {
        return (
          <BalanceItem key={currency}>
            <CurrencyIcon src={`/images/${currency}-icon.svg`} />
            <Balance>
              <DataHeaderLarge>
                {formatCurrency(balances[currency]) || '--'} SNX
              </DataHeaderLarge>
              <DataHeaderLarge color={theme.colorStyles.buttonTertiaryText}>
                ${prices[currency] || '--'} USD
              </DataHeaderLarge>
            </Balance>
          </BalanceItem>
        );
      })}
    </BalanceRow>
  );
};

const renderCollRatios = () => {
  return (
    <Row margin="0 0 22px 0">
      <Box>
        <Figure>700%</Figure>
        <DataLarge>Current collateralization ratio</DataLarge>
      </Box>
      <Box>
        <Figure>750%</Figure>
        <DataLarge>Target collateralization ratio</DataLarge>
      </Box>
    </Row>
  );
};

const renderPieChart = theme => {
  return (
    <Box full={true}>
      <Row padding="32px 16px">
        <PieChart data={[]} />
        <PieChartLegend>
          <DataHeaderLarge margin="0px 0px 24px 0px">
            YOUR SNX HOLDINGS:
          </DataHeaderLarge>
          <LegendRow style={{ backgroundColor: theme.colorStyles.accentLight }}>
            <DataLarge>10,000.00 SNX</DataLarge>
            <DataSmall>STAKING</DataSmall>
          </LegendRow>

          <LegendRow style={{ backgroundColor: theme.colorStyles.accentDark }}>
            <DataLarge>5,000.00 SNX</DataLarge>
            <DataSmall>TRANSFERRABLE</DataSmall>
          </LegendRow>
        </PieChartLegend>
      </Row>
    </Box>
  );
};

const renderTable = () => {
  return (
    <Row margin="22px 0 0 0">
      <Table
        header={[
          { key: 'rowLegend', value: '' },
          { key: 'snx', value: 'snx' },
          { key: 'sUSD', value: 'susd' },
          { key: 'eth', value: 'eth' },
          { key: 'synths', value: 'synths' },
          { key: 'debt', value: 'debt' },
        ]}
        data={[
          {
            rowLegend: 'balance',
            snx: '10,000.00',
            sUSD: '1,500.00',
            eth: '0.10',
            synths: '0.24 sUSD',
            debt: '0.29 sUSD',
          },
          {
            rowLegend: '$ USD',
            snx: '1,000.00',
            sUSD: '1,500.00',
            eth: '0.10',
            synths: '0.24 sUSD',
            debt: '0.29 sUSD',
          },
        ]}
      />
    </Row>
  );
};

const Dashboard = () => {
  const theme = useContext(ThemeContext);
  const [balances, setBalances] = useState({});
  const [prices, setPrices] = useState({});
  const {
    state: { wallet },
  } = useContext(Store);

  getBalances(wallet.currentWallet, balances, setBalances);
  getPrices(prices, setPrices);

  return (
    <DashboardWrapper>
      <Header currentWallet={wallet.currentWallet} />
      <Content>
        <Container>
          <ContainerHeader>
            <H5>Current Prices:</H5>
          </ContainerHeader>
          {renderBalances(balances, prices, theme)}
        </Container>
        <Container curved={true}>
          <Row padding="0px 8px">
            <DataLarge>
              <Highlighted>2 days</Highlighted> left to claim rewards
            </DataLarge>
            <Info theme={theme} />
          </Row>
        </Container>
        <Container>
          <ContainerHeader>
            <H5>Wallet Details:</H5>
            <DataHeaderLarge
              margin="0px 0px 22px 0px"
              color={theme.colorStyles.body}
            >
              USER ID: #100000000
            </DataHeaderLarge>
          </ContainerHeader>
          {renderCollRatios()}
          {renderPieChart(theme)}
          {renderTable()}
          <Row margin="18px 0 0 0 ">
            <Button>
              <ButtonTertiaryLabel>
                Go to Synthetix.Exchange
              </ButtonTertiaryLabel>
            </Button>
            <Button>
              <ButtonTertiaryLabel>
                View your Synths balance
              </ButtonTertiaryLabel>
            </Button>
          </Row>
        </Container>
      </Content>
    </DashboardWrapper>
  );
};

const DashboardWrapper = styled('div')`
  background: ${props => props.theme.colorStyles.panels};
  width: 623px;
  h1 {
    color: ${props => props.theme.colorStyles.heading};
    margin: 0;
  }
  p {
    color: ${props => props.theme.colorStyles.body};
    margin: 0;
  }
  // transition: all ease-out 0.5s;
  flex-shrink: 0;
  border-right: 1px solid ${props => props.theme.colorStyles.borders};
`;

const Content = styled('div')`
  padding: 0 32px;
`;

const Container = styled.div`
  border: 1px solid ${props => props.theme.colorStyles.borders};
  border-radius: ${props => (props.curved ? '40px' : '5px')};
  padding: ${props => (props.curved ? '10px' : '32px 24px')};
  margin: ${props => (props.curved ? '16px 0' : '0')};
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
`;

const CurrencyIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const Balance = styled.div`
  font-family: 'apercu-medium';
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  & :first-child {
    margin-bottom: 8px;
  }
`;

const ContainerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${props => (props.margin ? props.margin : 0)};
  padding: ${props => (props.padding ? props.padding : 0)};
`;

const Highlighted = styled.span`
  font-family: 'apercu-bold';
  color: ${props => props.theme.colorStyles.hyperlink};
`;

const Box = styled.div`
  border-radius: 2px;
  border: 1px solid ${props => props.theme.colorStyles.borders};
  width: ${props => (props.full ? '100%' : '240px')};
  height: ${props => (props.full ? '100%' : '96px')};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const PieChartLegend = styled.div`
  flex: 1;
  margin-left: 18px;
`;

const LegendRow = styled.div`
  margin-top: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  border-radius: 2px;
  justify-content: space-between;
`;

const Button = styled.div`
  background-color: ${props => props.theme.colorStyles.buttonTertiaryBgFocus};
  text-transform: uppercase;
  height: 48px;
  padding: 16px;
  border: 1px solid ${props => props.theme.colorStyles.borders};
  border-radius: 2px;
`;

export default Dashboard;
