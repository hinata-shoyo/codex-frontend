import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { get } from 'lodash-es';
import { useQueryClient } from 'react-query';

import Skeleton from '@material-ui/lab/Skeleton';
import Grid from '@material-ui/core/Grid';

import CustomAlert from '../../components/Alert';
import Text from '../../components/Text';
import DataDisplay from '../../components/dataDisplays/DataDisplay';
import ActionIcon from '../../components/ActionIcon';
import usePatchCollaboration from '../../models/collaboration/usePatchCollaboration';
import { getNthAlphabeticalMemberObjAndMakeLodashReady } from '../../utils/manipulators';
import queryKeys from '../../constants/queryKeys';

export default function UserManagersCollaborationEditTable({
  inputData,
  collaborationLoading,
  collaborationError,
}) {
  const queryClient = useQueryClient();
  const intl = useIntl();
  const [dismissed, setDismissed] = useState(false);
  const {
    patchCollaboration,
    error,
    isLoading,
    isError,
    isSuccess,
  } = usePatchCollaboration();
  const collabEditPath = '/managed_view_permission';
  const collabEditOp = 'replace';
  const revokedPermission = 'revoked';
  async function processRevoke(collaboration) {
    setDismissed(false);
    const collaborationData = [
      {
        op: collabEditOp,
        path: collabEditPath,
        value: {
          user_guid: get(collaboration, 'userOneGuid'),
          permission: revokedPermission,
        },
      },
    ];
    const collaborationDataTheOtherWay = [
      {
        op: collabEditOp,
        path: collabEditPath,
        value: {
          user_guid: get(collaboration, 'userTwoGuid'),
          permission: revokedPermission,
        },
      },
    ];
    patchCollaboration(
      get(collaboration, 'guid'),
      collaborationData,
      collaborationDataTheOtherWay,
    );
  }

  function tranformDataForCollabTable(originalData) {
    if (!originalData || originalData.length === 0) return null;
    return originalData
      .map(entry => {
        const member1 = getNthAlphabeticalMemberObjAndMakeLodashReady(
          get(entry, 'members'),
          1,
        );
        const member2 = getNthAlphabeticalMemberObjAndMakeLodashReady(
          get(entry, 'members'),
          2,
        );
        // Note: the collaboration API call returned a members OBJECT instead of array of objects, which made some tranformation gymnastics here necessary
        return {
          guid: get(entry, 'guid'),
          userOne: get(member1, 'full_name', get(member1, 'email')),
          userOneGuid: get(member1, 'guid'),
          userTwo: get(member2, 'full_name', get(member2, 'email')),
          userTwoGuid: get(member2, 'guid'),
          viewStatusOne: get(member1, 'viewState'),
          viewStatusTwo: get(member2, 'viewState'),
        };
        // editStatusOne: get(
        //   member1,
        //   'editState',
        // ),
        // editStatusTwo: get(
        //   member2,
        //   'editState',
        // ),
      })
      ?.filter(
        collab =>
          get(collab, 'viewStatusOne') !== revokedPermission ||
          get(collab, 'viewStatusTwo') !== revokedPermission,
      );
  }
  const tableFriendlyData = tranformDataForCollabTable(inputData);
  const tableColumns = [
    {
      name: 'userOne',
      align: 'right',
      label: intl.formatMessage(
        // Alignments in this table don't look great, but they are grouped into visually meaningful chunks. I'm open to more aesthetically pleasing ideas
        { id: 'USER_ONE' },
      ),
      options: {
        customBodyRender: userOne => (
          <Text variant="body2">{userOne}</Text>
        ),
      },
    },
    {
      name: 'viewStatusOne',
      align: 'left',
      label: intl.formatMessage({ id: 'USER_ONE_VIEW_STATUS' }),
      options: {
        customBodyRender: viewStatusOne => (
          <Text variant="body2">{viewStatusOne}</Text>
        ),
      },
    }, //     ), //       <Text variant="body2">{editStatusOne}</Text> //     customBodyRender: editStatusOne => ( //   options: { //   label: intl.formatMessage({ id: 'USER_ONE_EDIT_STATUS' }), //   name: 'editStatusOne', // {
    //   },
    // },
    {
      name: 'userTwo',
      align: 'right',
      label: intl.formatMessage({
        id: 'USER_TWO',
      }),
      options: {
        customBodyRender: userTwo => (
          <Text variant="body2">{userTwo}</Text>
        ),
      },
    },
    {
      name: 'viewStatusTwo',
      align: 'left',
      label: intl.formatMessage({ id: 'USER_TWO_VIEW_STATUS' }),
      options: {
        customBodyRender: viewStatusTwo => (
          <Text variant="body2">{viewStatusTwo}</Text>
        ),
      },
    }, //     ), //       <Text variant="body2">{editStatusTwo}</Text> //     customBodyRender: editStatusTwo => ( //   options: { //   label: intl.formatMessage({ id: 'USER_TWO_EDIT_STATUS' }), //   name: 'editStatusTwo', // {
    //   },
    // },
    {
      name: 'actions',
      align: 'left',
      label: intl.formatMessage({
        id: 'ACTIONS',
      }),
      options: {
        displayInFilter: false,
        customBodyRender: (_, collaboration) => (
          <div style={{ display: 'flex' }}>
            <ActionIcon
              variant="revoke"
              onClick={() => processRevoke(collaboration)}
              loading={isLoading}
            />
          </div>
        ),
      },
    },
  ];
  return [
    <Grid item>
      <DataDisplay
        idKey="guid"
        loading={isLoading}
        title={<FormattedMessage id="EDIT_COLLABORATIONS" />}
        style={{ marginTop: 8 }}
        variant="secondary"
        columns={tableColumns}
        data={tableFriendlyData || []}
      />
      {collaborationLoading ? (
        <Skeleton style={{ transform: 'unset' }} height={44} />
      ) : null}
      {collaborationError ? (
        <Text
          id="COLLABORATION_DATA_ERROR"
          variant="body2"
          style={{ margin: '8px 16px', display: 'block' }}
        />
      ) : null}
      {isError && !dismissed ? (
        <CustomAlert
          severity="error"
          titleId="COLLABORATION_REVOKE_ERROR"
          onClose={() => {
            queryClient.invalidateQueries(queryKeys.collaborations);
            setDismissed(true);
          }}
        >
          {error
            ? error +
              '. ' +
              intl.formatMessage({
                id: 'COLLAB_REVOKE_ERROR_SUPPLEMENTAL',
              })
            : intl.formatMessage({ id: 'UNKNOWN_ERROR' })}
        </CustomAlert>
      ) : null}
      {isSuccess && !dismissed ? (
        <CustomAlert
          severity="success"
          titleId="COLLABORATION_REVOKE_SUCCESS"
          onClose={() => {
            queryClient.invalidateQueries(queryKeys.collaborations);
            setDismissed(true);
          }}
        />
      ) : null}
    </Grid>,
  ];
}