import { Button, Container, Flex, Text, Card, Badge } from "@radix-ui/themes";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { formatTransactionDigest } from "../utils/transaction";

interface TransactionStatusProps {
  digest?: string;
  isSuccess?: boolean;
  error?: string;
  merchantName?: string;
  amount?: number;
  onReset: () => void;
}

export function TransactionStatus({
  digest,
  isSuccess = true,
  error,
  merchantName,
  amount,
  onReset,
}: TransactionStatusProps) {
  return (
    <Container my="2">
      <Card>
        <Flex direction="column" gap="4" p="4" align="center">
          {isSuccess ? (
            <>
              <Flex direction="column" align="center" gap="2">
                <CheckIcon width="48" height="48" color="green" />
                <Text size="5" weight="bold" color="green">
                  결제 완료!
                </Text>
              </Flex>

              <Flex direction="column" gap="2" align="center">
                {merchantName && (
                  <Text size="3">{merchantName}에서 결제가 완료되었습니다</Text>
                )}

                {amount && (
                  <Text size="4" weight="medium">
                    {amount.toFixed(2)} SUI
                  </Text>
                )}

                {digest && (
                  <Flex direction="column" align="center" gap="1">
                    <Text size="2" color="gray">
                      트랜잭션 ID
                    </Text>
                    <Badge variant="soft">
                      {formatTransactionDigest(digest)}
                    </Badge>
                  </Flex>
                )}
              </Flex>
            </>
          ) : (
            <>
              <Flex direction="column" align="center" gap="2">
                <Cross2Icon width="48" height="48" color="red" />
                <Text size="5" weight="bold" color="red">
                  결제 실패
                </Text>
              </Flex>

              {error && (
                <Text size="3" color="red" align="center">
                  {error}
                </Text>
              )}
            </>
          )}

          <Button size="3" onClick={onReset} style={{ width: "100%" }}>
            새로운 결제
          </Button>
        </Flex>
      </Card>
    </Container>
  );
}
