// import { eToNumber } from "components/Helpers";
import {
  approveTokenMaximumValue,
  UnilendFlashLoanCoreContract,
} from "ethereum/contracts";
import { FlashloanLBCore, IERC20 } from "ethereum/contracts/FlashloanLB";
import { web3Service } from "ethereum/web3Service";
import { Dispatch } from "redux";
import { ActionType } from "state/action-types";
import { DepositAction } from "state/actions/depositA";

// Allowance Should be checked to reveal the approval state of the contract
export const checkAllowance = (
  currentProvider: any,
  address: any,
  receipentAddress: string
) => {
  return async (dispatch: Dispatch<DepositAction>) => {
    dispatch({
      type: ActionType.DEPOSIT_ALLOWANCE_ACTION,
    });
    try {
      let allowance;
      let _IERC20 = await IERC20(currentProvider, receipentAddress);
      _IERC20.methods
        .allowance(address, UnilendFlashLoanCoreContract(currentProvider))
        .call((error: any, result: any) => {
          if (!error && result) {
            allowance = result;
            if (allowance === "0") {
              dispatch({
                type: ActionType.DEPOSIT_APPROVAL_STATUS,
                payload: false, // isApproved
              });
            } else {
              localStorage.setItem("isApproving", "false");
              dispatch({
                type: ActionType.DEPOSIT_APPROVE_SUCCESS,
              });
              dispatch({
                type: ActionType.DEPOSIT_APPROVAL_STATUS,
                payload: true, // isApproved
              });
            }
          } else {
            dispatch({
              type: ActionType.DEPOSIT_ALLOWANCE_FAILED,
            });
          }
        });
    } catch (e) {
      dispatch({
        type: ActionType.DEPOSIT_ALLOWANCE_FAILED,
      });
    }
  };
};

// On Approve Action
export const depositApprove = (
  currentProvider: any,
  address: any,
  receipentAddress: string
) => {
  return async (dispatch: Dispatch<DepositAction>) => {
    dispatch({
      type: ActionType.DEPOSIT_APPROVE_ACTION,
    });
    try {
      let _IERC20 = await IERC20(currentProvider, receipentAddress);
      localStorage.setItem("isApproving", "true");
      dispatch({
        type: ActionType.DEPOSIT_APPROVAL_STATUS,
        payload: false,
      });
      _IERC20.methods
        .approve(
          UnilendFlashLoanCoreContract(currentProvider),
          approveTokenMaximumValue
        )
        .send({
          from: address,
        })
        .on("receipt", (res: any) => {
          localStorage.setItem("isApproving", "false");
          dispatch({
            type: ActionType.DEPOSIT_APPROVAL_STATUS,
            payload: true,
          });
          dispatch({
            type: ActionType.DEPOSIT_APPROVE_SUCCESS,
          });
        })
        .on("error", (err: any, res: any) => {
          if (res === undefined) {
            dispatch({
              type: ActionType.DEPOSIT_APPROVE_FAILED,
              payload: false,
              // message: err.message.split(":")[1],
              message: "Approval Rejected",
            });
            dispatch({
              type: ActionType.DEPOSIT_APPROVAL_STATUS,
              payload: false,
            });
          } else {
            dispatch({
              type: ActionType.DEPOSIT_APPROVE_FAILED,
              payload: false,
              message: "Approval Failed",
            });
            dispatch({
              type: ActionType.DEPOSIT_APPROVAL_STATUS,
              payload: false,
            });
          }
        });
      // .catch((e: Error) => {
      //   localStorage.setItem("isApproving", "false");
      //   dispatch({
      //     type: ActionType.,
      //   });
      //   dispatch({
      //     type: ActionType.DEPOSIT_APPROVAL_STATUS,
      //     payload: false,
      //   });
      // });
    } catch (e) {
      dispatch({
        type: ActionType.DEPOSIT_APPROVE_FAILED,
      });
    }
  };
};

export const handleDeposit = (
  currentProvider: any,
  depositAmount: any,
  address: string,
  recieptAddress: string,
  isEth: boolean,
  decimal: any
) => {
  return async (dispatch: Dispatch<DepositAction>) => {
    dispatch({
      type: ActionType.DEPOSIT_ACTION,
    });
    try {
      let fullAmount = web3Service.getValue(
        isEth,
        currentProvider,
        depositAmount,
        decimal
      );
      // let amount = eToNumber(fullAmount);
      // console.log("fullAmount", eToNumber(fullAmount));
      FlashloanLBCore(currentProvider)
        .methods.deposit(recieptAddress, fullAmount)
        .send({
          from: address,
          value: isEth ? fullAmount : 0,
        })
        .on("receipt", () => {
          dispatch({
            type: ActionType.DEPOSIT_SUCCESS,
            payload: true,
          });
        })
        .on("transactionHash", (hash: any) => {
          dispatch({
            type: ActionType.DEPOSIT_TRANSACTION_HASH,
            payload: hash,
          });
        })
        // .on("confirmation", function (confirmationNumber: any, receipt: any) {
        //   console.log(confirmationNumber, receipt);
        // })
        .on("error", (err: any, res: any) => {
          if (res === undefined) {
            dispatch({
              type: ActionType.DEPOSIT_FAILED,
              payload: false,
              // message: err.message.split(":")[1],
              message: "Transaction Rejected",
            });
          } else {
            dispatch({
              type: ActionType.DEPOSIT_FAILED,
              payload: false,
              message: "Transaction Failed",
            });
          }
        });
    } catch (e) {
      dispatch({
        type: ActionType.DEPOSIT_FAILED,
        payload: false,
        message: "Transaction Failed",
      });
    }
  };
};

export const clearDepositError = () => {
  return async (dispatch: Dispatch<DepositAction>) => {
    dispatch({
      type: ActionType.DEPOSIT_MESSAGE_CLEAR,
    });
  };
};
