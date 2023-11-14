import DataTable from '@commercetools-uikit/data-table';
import SelectInput from '@commercetools-uikit/select-input';
import Spacings from '@commercetools-uikit/spacings';
import { PayPalSettingsType } from '../../types/types';
import Text from '@commercetools-uikit/text';
import messages from './messages';

const ThreeDSecureAcceptanceMatrix = ({
  values,
  handleChange,
}: PayPalSettingsType) => {
  const ACTION_CONTINUE = 'Continue with authorization.';
  const ACTION_NO_CONTINUE = 'Do not continue with authorization.';
  const ACTION_NO_CONTINUE_RETRY =
    'Do not continue with authorization. Request cardholder to retry.';

  const customCellRenderer = (row: string) => {
    const INPUT_NAME = `threeDSAction_${row}`;

    return (
      <SelectInput
        name={`threeDSAction.${INPUT_NAME}`}
        value={values.threeDSAction[INPUT_NAME]}
        onChange={handleChange}
        options={[
          { value: '2', label: ACTION_CONTINUE },
          { value: '1', label: ACTION_NO_CONTINUE_RETRY },
          { value: '0', label: ACTION_NO_CONTINUE },
        ]}
      />
    );
  };

  const rows = [
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'Y',
      LiabilityShift: 'POSSIBLE',
      Recommended_action: ACTION_CONTINUE,
      Action: customCellRenderer('1'),
      id: '1',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'Y',
      LiabilityShift: 'YES',
      Recommended_action: ACTION_CONTINUE,
      Action: customCellRenderer('2'),
      id: '2',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'N',
      LiabilityShift: 'NO',
      Recommended_action: ACTION_NO_CONTINUE,
      Action: customCellRenderer('3'),
      id: '3',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'R',
      LiabilityShift: 'NO',
      Recommended_action: ACTION_NO_CONTINUE,
      Action: customCellRenderer('4'),
      id: '4',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'A',
      LiabilityShift: 'POSSIBLE',
      Recommended_action: ACTION_CONTINUE,
      Action: customCellRenderer('5'),
      id: '5',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'U',
      LiabilityShift: 'UNKNOWN',
      Recommended_action: ACTION_NO_CONTINUE_RETRY,
      Action: customCellRenderer('6'),
      id: '6',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'U',
      LiabilityShift: 'NO',
      Recommended_action: ACTION_NO_CONTINUE_RETRY,
      Action: customCellRenderer('7'),
      id: '7',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: 'C',
      LiabilityShift: 'UNKNOWN',
      Recommended_action: ACTION_NO_CONTINUE_RETRY,
      Action: customCellRenderer('8'),
      id: '8',
    },
    {
      EnrollmentStatus: 'Y',
      Authentication_Status: '',
      LiabilityShift: 'NO',
      Recommended_action: ACTION_NO_CONTINUE_RETRY,
      Action: customCellRenderer('9'),
      id: '9',
    },
    {
      EnrollmentStatus: 'N',
      Authentication_Status: '',
      LiabilityShift: 'NO',
      Recommended_action: ACTION_CONTINUE,
      Action: customCellRenderer('10'),
      id: '10',
    },
    {
      EnrollmentStatus: 'U',
      Authentication_Status: '',
      LiabilityShift: 'NO',
      Recommended_action: ACTION_CONTINUE,
      Action: customCellRenderer('11'),
      id: '11',
    },
    {
      EnrollmentStatus: 'U',
      Authentication_Status: '',
      LiabilityShift: 'UNKNOWN',
      Recommended_action: ACTION_NO_CONTINUE_RETRY,
      Action: customCellRenderer('12'),
      id: '12',
    },
    {
      EnrollmentStatus: 'B',
      Authentication_Status: '',
      LiabilityShift: 'NO',
      Recommended_action: ACTION_CONTINUE,
      Action: customCellRenderer('13'),
      id: '13',
    },
    {
      EnrollmentStatus: '',
      Authentication_Status: '',
      LiabilityShift: 'UNKNOWN',
      Recommended_action: ACTION_NO_CONTINUE_RETRY,
      Action: customCellRenderer('14'),
      id: '14',
    },
  ];

  const columns = [
    { key: 'EnrollmentStatus', label: 'EnrollmentStatus' },
    { key: 'Authentication_Status', label: 'Authentication_Status' },
    { key: 'LiabilityShift', label: 'LiabilityShift' },
    { key: 'Recommended_action', label: 'Recommended action' },
    { key: 'Action', label: 'Action' },
  ];
  return (
    <>
      <Spacings.Stack scale="xs" alignItems="stretch">
        <Text.Headline as="h3" intlMessage={messages.threeDSActionTitle} />
        <Text.Detail intlMessage={messages.threeDSActionSubTitle} />
      </Spacings.Stack>
      <DataTable
        itemRenderer={(row, column) => {
          // @ts-ignore
          return row[column.key];
        }}
        rows={rows}
        columns={columns}
      />
    </>
  );
};

export default ThreeDSecureAcceptanceMatrix;
