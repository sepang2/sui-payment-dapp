import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex } from "@radix-ui/themes";
import { useState } from "react";

export function SendToken() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState("");

  const tx = new Transaction();

  if (!account) {
    return;
  }

  return (
    <Flex direction="column" my="2">
      {account && (
        <>
          <div>
            <Button
              onClick={() => {
                signAndExecuteTransaction(
                  {
                    transaction: tx,
                    chain: "sui:testnet",
                  },
                  {
                    onSuccess: (result) => {
                      console.log("signed transaction block", result);
                      setDigest(result.digest);
                    },
                  },
                );
              }}
            >
              Send
            </Button>
          </div>
          <div>Signature: {digest}</div>
        </>
      )}
    </Flex>
  );
}
