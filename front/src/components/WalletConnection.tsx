import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Container, Flex, Heading, Text, Card, Badge } from "@radix-ui/themes";
import { useBalance } from "../hooks/useBalance";

export function WalletConnection() {
  const account = useCurrentAccount();
  const { balance, isPending, error } = useBalance();

  return (
    <Container my="2">
      <Card>
        <Flex direction="column" gap="3" p="4">
          <Flex justify="between" align="center">
            <Heading size="4">지갑 연결 상태</Heading>
            <ConnectButton />
          </Flex>

          {account ? (
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <Badge color="green">연결됨</Badge>
                <Text size="2" color="gray">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </Text>
              </Flex>

              <Flex direction="column" gap="1">
                <Text size="2" weight="medium">
                  SUI 잔액
                </Text>
                {isPending ? (
                  <Text size="2">로딩 중...</Text>
                ) : error ? (
                  <Text size="2" color="red">
                    잔액 조회 실패
                  </Text>
                ) : (
                  <Text size="3" weight="bold">
                    {balance.toFixed(4)} SUI
                  </Text>
                )}
              </Flex>
            </Flex>
          ) : (
            <Flex align="center" gap="2">
              <Badge color="gray">연결 안됨</Badge>
              <Text size="2" color="gray">
                지갑을 연결해주세요
              </Text>
            </Flex>
          )}
        </Flex>
      </Card>
    </Container>
  );
}
